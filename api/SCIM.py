
import logging
import urllib.parse
import time
import json
from typing import cast, Any, Dict, List, Optional, Tuple
from secrets import token_urlsafe
import jwt
import re

import tornado.httpclient
import tornado.web

## https://stackoverflow.com/questions/201323/how-to-validate-an-email-address-using-a-regular-expression
EMAIL_REGEX = re.compile(r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])")


class SCIMClient():
    @staticmethod
    def http() -> tornado.httpclient.AsyncHTTPClient:
        return tornado.httpclient.AsyncHTTPClient()

    def __init__(self, gluu_api_base:str, key: str, secret: str, kid: str):
        self.gluu_api_base = gluu_api_base
        self.token_url = f"{gluu_api_base}/oxauth/restv1/token"
        self.scim_users_url = f"{gluu_api_base}/identity/restv1/scim/v2/Users/"
        self.scim_groups_url = f"{gluu_api_base}/identity/restv1/scim/v2/Groups/"
        self.client_id = key
        self.oauth_key = secret
        self.oauth_kid = kid
        self.rpt: Optional[str] = None
        self.pct: Optional[str] = None

    async def renewAuthorization(self, response: tornado.httpclient.HTTPResponse) -> None:
        auth_header  = dict((k.strip(), v.strip()) for k,v in (h.split('=', 1) for h in response.headers["WWW-Authenticate"].split(',')))
        ticket = auth_header['ticket']
        assert self.gluu_api_base.startswith(f'https://{auth_header["host_id"]}')
        request = {
                "grant_type": 'urn:ietf:params:oauth:grant-type:uma-ticket',
                "ticket": ticket,
                "scope": 'uma_protection',
                "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                "client_assertion": jwt.encode({
                    'iss': self.client_id,
                    'sub': self.client_id,
                    'aud': self.token_url,
                    'jti': token_urlsafe(16),
                    'exp': int(time.time()) + 300, #seconds
                    'iat': int(time.time())
                }, key=self.oauth_key, algorithm='RS256', headers={'kid':self.oauth_kid})
        }
        if self.pct:
            request['pct'] = self.pct
        body = urllib.parse.urlencode(request)
        response = await self.http().fetch(
            self.token_url,
            method="POST",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body=body
        )
        response_body = json.loads(response.body)
        self.rpt = response_body['access_token']
        self.pct = response_body['pct']
        assert response_body['token_type'] == 'Bearer'

    @property
    def authorization_header(self) -> str:
        return f'Bearer {self.rpt}' if self.rpt else ''

    # Wrapper around tornado.httpclient.AsyncHTTPClient.fetch()
    async def _callScimApi(self, *args: Any, **kwargs: Any) -> tornado.httpclient.HTTPResponse:
        if 'headers' not in kwargs:
            kwargs['headers'] = {}
        if self.rpt:
            kwargs['headers']['Authorization'] = self.authorization_header
        kwargs['raise_error'] = False
        response = await self.http().fetch(*args, **kwargs)
        if response.code == 401 and 'WWW-Authenticate' in response.headers:
            await self.renewAuthorization(response)
            kwargs['headers']['Authorization'] = self.authorization_header
            response = await self.http().fetch(*args, **kwargs)
        return response

    async def getUsersList(self) -> List[Dict[str, Any]]:
        response = await self._callScimApi(f'{self.scim_users_url}')
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        return cast(List[Dict[str, Any]], response_json['Resources'] if 'Resources' in response_json else list())

    async def findUsersByAttr(self, attribute: str, value: str) -> List[Dict[str, Any]]:
        if not attribute.replace('.','').isalpha():
            raise ValueError('Attribute name invalid')
        assert isinstance(value, str)
        assert isinstance(attribute, str)
        request = {
            'filter': f'{attribute} eq {json.dumps(value)}',
        }
        logging.debug(f"Filter: {urllib.parse.urlencode(request)}")
        response = await self._callScimApi(f'{self.scim_users_url}?{urllib.parse.urlencode(request)}')
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        return cast(List[Dict[str, Any]], response_json['Resources'] if 'Resources' in response_json else list())

    async def createUser(self, **kwargs: Dict[str, Any]) -> List[Dict[str, Any]]:
        request = kwargs
        body = json.dumps(request)
        logging.debug(f"Creating user: {body}")
        response = await self._callScimApi(
            f'{self.scim_users_url}',
            method="POST",
            headers={
                "Content-Type": "application/json",
            },
            body=body)
        if response.code // 100 != 2:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        return cast(List[Dict[str, Any]], response_json)

    async def _changeGroupMembership(self, userInum: str, groupInum: str, member: bool) -> Dict[str, Any]:
        assert re.match(r'[a-f0-9-]+', userInum)
        assert re.match(r'[a-f0-9-]+', groupInum)
        patch_request = { "schemas":
            ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
                "Operations":[
                    {
                        "op":"add" if member else "remove",
                        "path":"members" if member else f"members[value eq \"{userInum}\"]",
                        "value":[
                            {
                                "value": userInum,
                                "$ref": f'{self.scim_users_url}{userInum}'
                            }
                        ]
                    },
                ]
            }
        logging.debug(f"Patching group {groupInum}: {json.dumps(patch_request)}")
        response = await self._callScimApi(
            f'{self.scim_groups_url}{groupInum}',
             method="PATCH",
             body=json.dumps(patch_request),
             headers={
                 'Content-type': 'application/json'
             })
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        logging.debug(f"Reply: {response_json}")
        return cast(Dict[str, Any], response_json)

    async def addGroupMembership(self, userInum: str, groupInum: str) -> Dict[str, Any]:
        return await self._changeGroupMembership(userInum, groupInum, True)

    async def removeGroupMembership(self, userInum: str, groupInum: str) -> Dict[str, Any]:
        return await self._changeGroupMembership(userInum, groupInum, False)

    async def getGroupMembership(self, groupInum: str) -> Tuple[str, ...]:
        assert re.match(r'[a-f0-9-]+', groupInum)
        request = {
            'attributes': 'members'
        }
        response = await self._callScimApi(f'{self.scim_groups_url}{groupInum}?{urllib.parse.urlencode(request)}')
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        logging.debug(f"Reply: {response_json}")
        return tuple(cast(str, member['value']) for member in (response_json['members'] if 'members' in response_json else ()))

    async def getGroupsForUser(self, userInum: str) -> Tuple[str, ...]:
        assert re.match(r'[a-f0-9-]+', userInum)
        request = {
            'attributes': 'groups'
        }
        response = await self._callScimApi(f'{self.scim_users_url}{userInum}?{urllib.parse.urlencode(request)}')
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        logging.debug(f"Reply: {response_json}")
        return tuple(cast(str, group['value']) for group in (response_json['groups'] if 'groups' in response_json else ()))

    async def updateUser(self, userInum: str, **fields: str ) -> Dict[str, Any]:
        assert re.match(r'[a-f0-9-]+', userInum)
        operations = []
        if 'email' in fields:
            email = fields['email']
            if not re.match(EMAIL_REGEX, email):
                raise tornado.web.HTTPError(400, "Wrong email format")
            operations.append(
                    {
                        "op": "replace",
                        "path": "emails",
                        "value":[
                            {
                                "value": email,
                                "primary": True
                            }
                        ]
                    },
            )
        if 'name' in fields:
            name = fields['name']
            if not name:
                raise tornado.web.HTTPError(400, "Name cannot be empty")
            operations.append(
                    {
                        "op": "replace",
                        "path": "displayName",
                        "value": name
                    },
            )
        if 'nickname' in fields:
            nickname = fields['nickname']
            if nickname:
                operations.append(
                        {
                            "op": "replace",
                            "path": "nickName",
                            "value": nickname
                        },
                )
            else:
                operations.append(
                        {
                            "op": "remove",
                            "path": "nickName"
                        },
                )
        patch_request = { "schemas":
            ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
                "Operations": operations
            }
        logging.debug(f"Patching user {userInum}: {json.dumps(patch_request)}")
        response = await self._callScimApi(
            f'{self.scim_users_url}{userInum}',
             method="PATCH",
             body=json.dumps(patch_request),
             headers={
                 'Content-type': 'application/json'
             })
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body.decode())
        response_json = json.loads(response.body)
        logging.debug(f"Reply: {response_json}")
        return cast(Dict[str, Any], response_json)
