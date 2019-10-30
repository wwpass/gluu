import logging
import os
import pwd
import grp
import urllib
import urllib.parse
import time
import json
from typing import cast, Any, Dict, List, Optional

from secrets import token_urlsafe
import jwt

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
import tornado.httpclient
from tornado.options import define, options, parse_config_file, parse_command_line
import tornado.escape
base_path = os.path.abspath(os.path.dirname(__file__))
os.chdir(base_path)

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
        response = await self._callScimApi(self.scim_users_url)
        if response.code != 200:
            raise tornado.httpclient.HTTPError(response.code, response.body)
        return cast(List[Dict[str, Any]], json.loads(response.body)['Resources'])


class SCIMHandler(tornado.web.RequestHandler, tornado.auth.OAuth2Mixin): #type: ignore #pylint: disable=abstract-method

    async def get(self) -> None: #pylint: disable=arguments-differ
        users = await self.settings['scim'].getUsersList()
        import pprint
        self.write(pprint.pformat(users).replace('\n', '<br>'))
        self.finish()

def define_options() -> None:
    define("config",default="/etc/wwpass/oauth2.conf")
    define("template_path",default=os.path.normpath(os.path.join(base_path, 'templates')))

    define("user",default=None)
    define("group",default=None)

    define("debug", type=bool, default=False)
    define("bind", default="0.0.0.0")
    define("port", type=int, default=9061)

    define("gluu_url", type=str)

    define("uma2_id", type=str)
    define("uma2_secret", type=str)
    define("uma2_kid", type=str)


urls = [
    (r"/", tornado.web.RedirectHandler, {"url": "/anyconnect"}),
    (r"/scim/?", SCIMHandler),
]


if __name__ == "__main__":
    define_options()
    parse_command_line()
    parse_config_file(options.config)



    settings = {
        'template_path': options.template_path,
        'debug': options.debug,
        'autoescape': None,
        'options': options,
        'xheaders': True,
        'scim': SCIMClient(options['gluu_url'], options['uma2_id'], options['uma2_secret'], options['uma2_kid'])
    }

    application = tornado.web.Application(urls, **settings)

    logging.info('Starting server')
    server = tornado.httpserver.HTTPServer(application, xheaders=True)
    server.listen(options.port,options.bind)
    logging.info('Listening on : %s/%s ',options.port,options.bind)
    logging.info('Logging : %s ; Debug : %s',options.logging, options.debug)

    if options.group:
        logging.info("Dropping privileges to group: %s/%s", options.group, grp.getgrnam(options.group)[2])
        os.setgid(grp.getgrnam(options.group)[2])
    if options.user:
        os.initgroups(options.user,pwd.getpwnam(options.user)[3])
        logging.info("Dropping privileges to user: %s/%s", options.user, pwd.getpwnam(options.user)[2])
        os.setuid(pwd.getpwnam(options.user)[2])

    tornado.ioloop.IOLoop.instance().start()
