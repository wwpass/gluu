import logging
import urllib
import urllib.parse
from secrets import token_urlsafe
import  time
from typing import cast, Any, ClassVar, Dict, Optional, Mapping, Sequence
import json

import jwt
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
import tornado.escape
from tornado.httputil import url_concat

class GluuOAuth2MixIn(tornado.auth.OAuth2Mixin): #type: ignore
    _OAUTH_NO_CALLBACKS = False
    _GLUU_BASE_URL:ClassVar[str]
    _OAUTH_AUTHORIZE_URL:ClassVar[str]
    _OAUTH_ACCESS_TOKEN_URL:ClassVar[str]
    _OAUTH_USERINFO_URL:ClassVar[str]
    _OAUTH_KEY:ClassVar[str]
    _OAUTH_SECRET:ClassVar[str]

    @classmethod
    def set_api_url(cls, gluu_api_base:str, key: str, secret: str) -> None:
        cls._GLUU_BASE_URL = gluu_api_base
        cls._OAUTH_AUTHORIZE_URL = f"{gluu_api_base}/oxauth/restv1/authorize"
        cls._OAUTH_ACCESS_TOKEN_URL = f"{gluu_api_base}/oxauth/restv1/token"
        cls._OAUTH_USERINFO_URL = f"{gluu_api_base}/oxauth/restv1/userinfo"
        cls._OAUTH_KEY = key
        cls._OAUTH_SECRET = secret

    async def get_authenticated_user(
        self, redirect_uri: str, code: str
    ) -> Dict[str, Any]:
        http = self.get_auth_http_client()
        request: Dict[str, Any] = {
            "redirect_uri": redirect_uri,
            "code": code,
            "client_id": self._OAUTH_KEY,
            "grant_type": "authorization_code",
        }
        jwt_request = dict(request)
        jwt_request.update({
            'iss': self._OAUTH_KEY,
            'sub': self._OAUTH_KEY,
            'jti': token_urlsafe(16),
            'aud': self._OAUTH_ACCESS_TOKEN_URL,
            'exp': int(time.time()) + 300, #seconds
            'iat': int(time.time())
        })
        request.update({
            'client_assertion': jwt.encode(jwt_request, key=self._OAUTH_SECRET, algorithm='HS256'),
            'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        })
        body = urllib.parse.urlencode(request)
        logging.debug(f"Token request: {jwt_request}")
        response = await http.fetch(
            self._OAUTH_ACCESS_TOKEN_URL,
            method="POST",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            body=body
        )
        return tornado.escape.json_decode(response.body) #type: ignore

    def authorize_redirect( #pylint: disable=arguments-differ
        self,
        redirect_uri: str,
        extra_params: Optional[Mapping[str, str]] = None,
        callback: None = None,
        scope: Sequence[str] = ('openid'),
        response_type: str = 'code',
        state: Any = None
    ) -> None:

        request: Dict[str, Any] = {
            'scope': ' '.join(scope),
            'response_type': response_type,
            'client_id': self._OAUTH_KEY,
            'redirect_uri': redirect_uri,
        }

        if extra_params:
            request.update(extra_params)
        jwt_request = dict(request)
        jwt_request.update({
            'iss': self._OAUTH_KEY,
            'aud': self._GLUU_BASE_URL,
        })
        logging.debug(f"Authorization request: {jwt_request}")
        request.update({
            'request': jwt.encode(jwt_request, key=self._OAUTH_SECRET, algorithm='HS256'),
        })
        if state:
            request['state'] = json.dumps(state)
        logging.debug(f"Authorization request: {request}")

        self.redirect(
            url_concat(self._OAUTH_AUTHORIZE_URL, request))

    async def get_userinfo(self, access_token: str) -> Dict[str, Any]:
        return cast(Dict[str, Any], await self.oauth2_request(  #pylint: disable=no-value-for-parameter
            self._OAUTH_USERINFO_URL,
            access_token=access_token))
