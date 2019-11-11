
import logging
import urllib.parse
import time
import json
from typing import cast, Any, Dict, List, Optional
from secrets import token_urlsafe
import jwt

import tornado.httpclient


class SCIMClient():
    @staticmethod
    def http() -> tornado.httpclient.AsyncHTTPClient:
        return tornado.httpclient.AsyncHTTPClient()

    def __init__(self, gluu_api_base:str, key: str, secret: str, kid: str):
        self.gluu_api_base = gluu_api_base
        self.token_url = f"{gluu_api_base}/oxauth/restv1/token"
        self.scim_users_url = f"{gluu_api_base}/identity/restv1/scim/v2/Users/"
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
        if self.rpt:
            request['rpt'] = self.rpt
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
        logging.info(f"Response auth: {response_body}")
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
        request = {
        }
        logging.debug(f"Filter: {urllib.parse.urlencode(request)}")
        response = await self._callScimApi(f'{self.scim_users_url}?{urllib.parse.urlencode(request)}')
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body)
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
            raise tornado.httpclient.HTTPError(response.code, response.body)
        response_json = json.loads(response.body)
        return cast(List[Dict[str, Any]], response_json['Resources'] if 'Resources' in response_json else list())

    async def createUser(self, **kwargs: Dict[str, Any]) -> None:
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
            raise tornado.httpclient.HTTPError(response.code, response.body)
        response_json = json.loads(response.body)
        return cast(List[Dict[str, Any]], response_json)
