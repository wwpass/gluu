import logging
import os
import pwd
import grp
import urllib
import urllib.parse


from typing import Any, ClassVar, Dict

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
from tornado.options import define, options, parse_config_file, parse_command_line
import tornado.escape
base_path = os.path.abspath(os.path.dirname(__file__))
static_path = os.path.realpath(os.path.join(base_path, './static'))
os.chdir(base_path)

class GluuOAuth2MixIn(tornado.auth.OAuth2Mixin): #type: ignore
    _OAUTH_NO_CALLBACKS = False
    _OAUTH_AUTHORIZE_URL:ClassVar[str]
    _OAUTH_ACCESS_TOKEN_URL:ClassVar[str]
    _OAUTH_USERINFO_URL:ClassVar[str]
    _OAUTH_KEY:ClassVar[str]
    _OAUTH_SECRET:ClassVar[str]

    @classmethod
    def set_api_url(cls, gluu_api_base:str, key: str, secret: str) -> None:
        cls._OAUTH_AUTHORIZE_URL = f"{gluu_api_base}/oxauth/restv1/authorize"
        cls._OAUTH_ACCESS_TOKEN_URL = f"{gluu_api_base}/oxauth/restv1/token"
        cls._OAUTH_USERINFO_URL = f"{gluu_api_base}/oxauth/restv1/userinfo"
        cls._OAUTH_KEY = key
        cls._OAUTH_SECRET = secret

    async def get_authenticated_user(
        self, redirect_uri: str, code: str
    ) -> Dict[str, Any]:
        http = self.get_auth_http_client()
        body = urllib.parse.urlencode(
            {
                "redirect_uri": redirect_uri,
                "code": code,
                "client_id": self._OAUTH_KEY,
                "client_secret": self._OAUTH_SECRET,
                "grant_type": "authorization_code",
            }
        )
        response = await http.fetch(
            self._OAUTH_ACCESS_TOKEN_URL,
            method="POST",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            body=body,
        )
        return tornado.escape.json_decode(response.body) #type: ignore

class AnyConnectHandler(tornado.web.RequestHandler, GluuOAuth2MixIn): #type: ignore #pylint: disable=abstract-method
    """
    Handler for AnyConnect login
    """
    async def get(self) -> None: #pylint: disable=arguments-differ
        if not self.settings['options'].anyconnect_host or not self.settings['options'].anyconnect_group:
            self.render('error.html',reason='AnyConnect not configured on this instance')
            return
        if self.get_argument('error', False):
            self.render('error.html',reason=self.get_argument('error'))
            return
        if self.get_argument('code', False):
            try:
                access = await self.get_authenticated_user(
                    redirect_uri=f'{self.settings["options"].base_url}anyconnect/',
                    code=self.get_argument('code'))
                user = await self.oauth2_request(  #pylint: disable=no-value-for-parameter
                    self._OAUTH_USERINFO_URL,
                    access_token=access["access_token"])
            except Exception:
                self.render('error.html',reason="Access denied")
                return
            if 'ro_nonce' not in user:
                self.render('error.html',reason="Access denied")
                return

            self.render('anyconnect.html',
                ticket='redirect',
                wwpass_connector_link = self.settings['options'].wwpass_connector_link,
                cisco_link='https://%s/' % self.settings['options'].anyconnect_host,
                anyconnect_url='anyconnect://connect/?%s' % urllib.parse.urlencode({
                    'host': self.settings['options'].anyconnect_host,
                    'prefill_group_list': self.settings['options'].anyconnect_group,
                    'prefill_username': user['user_name'],
                    'prefill_password': user['ro_nonce']
                }))
        else:
            await self.authorize_redirect(
                redirect_uri=f'{self.settings["options"].base_url}anyconnect/',
                client_id=self._OAUTH_KEY,
                scope=['openid', 'ro_nonce', 'user_name', 'super_gluu_ro_session'],
                response_type='code')

def define_options() -> None:
    define("config",default="/etc/wwpass/oauth2.conf")
    define("template_path",default=os.path.normpath(os.path.join(base_path, 'templates')))

    define("user",default=None)
    define("group",default=None)

    define("debug", type=bool, default=False)
    define("bind", default="0.0.0.0")
    define("port", type=int, default=9061)
    define("base_url", type=str)

    define("gluu_url", type=str)
    define("oauth2_id", type=str)
    define("oauth2_secret", type=str)

    define("anyconnect_host", type=str)
    define("anyconnect_group", type=str)
    define("wwpass_connector_link", type=str)

urls = [
    (r"/", tornado.web.RedirectHandler, {"url": "/anyconnect"}),
    (r"/anyconnect/?", AnyConnectHandler),
    (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": static_path})
]


if __name__ == "__main__":
    define_options()
    parse_command_line()
    parse_config_file(options.config)

    GluuOAuth2MixIn.set_api_url(options['gluu_url'], options['oauth2_id'], options['oauth2_secret'])

    settings = {
        'template_path': options.template_path,
        'debug': options.debug,
        'autoescape': None,
        'options': options,
        'xheaders': True,
        'static_path': static_path,
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
