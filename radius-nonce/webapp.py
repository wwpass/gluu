import logging
import os
import pwd
import grp
import urllib
import urllib.parse
from secrets import token_urlsafe
from time import time

from typing import cast, Any, ClassVar, Dict, List, Optional, Tuple, Sequence

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
from tornado.options import define, options, parse_config_file, parse_command_line
import tornado.escape

from GluuOIDCClient import GluuOAuth2MixIn

base_path = os.path.abspath(os.path.dirname(__file__))
os.chdir(base_path)

class NonceDB:
    nonces: ClassVar[Dict[str,Tuple[float, Dict[str, Any]]]] = {}
    NONCE_TTL: ClassVar[int] = 60 # Seconds

    @classmethod
    def create_nonce(cls, userinfo: Dict[str, Any]) -> str:
        nonce = token_urlsafe(32)
        cls.nonces[nonce] = (time() + cls.NONCE_TTL, userinfo)
        return nonce

    @classmethod
    def get_user(cls, nonce: str) -> Optional[Dict[str, Any]]:
        if nonce not in cls.nonces:
            return None
        timeout, userinfo = cls.nonces[nonce]
        del cls.nonces[nonce]
        return userinfo if time() < timeout else None

class BaseHandler(tornado.web.RequestHandler):
    def get_available_profiles(self, userinfo: Dict[str,Any]) -> Tuple[str, ...]:
        groups = cast(Sequence[str], userinfo.get("member_of", ()))
        logging.debug(f"Groups: {groups}")
        logging.debug(f"Profiles: {tuple(profile for profile, group in self.settings['options'].profiles.items() if group in groups)}")
        return tuple(profile for profile, group in self.settings['options'].profiles.items() if group in groups or group == '')

class NonceCheck(BaseHandler): #pylint: disable=abstract-method
    def post(self) -> None:
        if not self.request.remote_ip.startswith('127.'):
            logging.debug(f"API request from remote IP: {self.request.remote_ip}")
            raise tornado.web.HTTPError(403,"Invalid credentials")
        username: str = self.get_argument("username","")
        nonce: str = self.get_argument("nonce","")
        profile: str = self.get_argument("profile","")
        if username != self.settings['options'].default_username or not nonce or not profile:
            logging.debug(f"Bad parameters: {self.request.arguments}")
            raise tornado.web.HTTPError(403,"Invalid credentials")
        userinfo = NonceDB.get_user(nonce)
        if not userinfo:
            logging.debug(f"Bad nonce: {nonce}")
            raise tornado.web.HTTPError(403,"Invalid credentials")
        if profile not in self.get_available_profiles(userinfo):
            logging.debug(f"Bad profile value: {profile}")
            raise tornado.web.HTTPError(403,"Invalid credentials")
        self.write("OK")
        self.finish()

class AnyConnectHandler(BaseHandler, GluuOAuth2MixIn): #pylint: disable=abstract-method
    """
    Handler for AnyConnect login
    """
    def get_template_namespace(self) -> Dict[str, Any]:
        ns = super().get_template_namespace()
        ns['options'] = self.settings['options']
        return ns

    async def get(self) -> None: #pylint: disable=arguments-differ
        if not self.settings['options'].anyconnect_host:
            self.render('error.html',reason='AnyConnect not configured on this instance')
            return
        if self.get_argument('error', False): #type: ignore
            self.render('error.html',reason=self.get_argument('error'))
            return
        if self.get_argument('code', False): #type: ignore
            try:
                access = await self.get_authenticated_user(
                    redirect_uri=f'{self.settings["options"].base_url}/anyconnect/',
                    code=self.get_argument('code'))
                user = await self.get_userinfo(access['access_token'])
            except Exception:
                self.render('error.html',reason="Access denied")
                return
            logging.debug(f"Got userinfo: {user}")
            self.render('anyconnect.html',
                ticket='redirect',
                cisco_link='https://%s/' % self.settings['options'].anyconnect_host,
                anyconnect_url='anyconnect://connect/?%s' % urllib.parse.urlencode({
                    'host': self.settings['options'].anyconnect_host,
                    'prefill_username': self.settings['options'].default_username,
                    'prefill_password': NonceDB.create_nonce(user)
                }),
                available_profiles = self.get_available_profiles(user))
        else:
            self.authorize_redirect(
                redirect_uri=f'{self.settings["options"].base_url}/anyconnect/',
                scope=['openid', 'profile'],
                response_type='code')

def define_options() -> None:
    define("config",default="/etc/wwpass/oauth2.conf")
    define("template_path",default=os.path.normpath(os.path.join(base_path, 'templates')))
    define("static_path",default=os.path.realpath(os.path.join(base_path, './static/wwpass')))

    define("title", type=str, default='WWPass')

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
    define("wwpass_connector_link", type=str)
    define("default_username", type=str, default="wwpassuser")
    define("profiles", type=dict)

if __name__ == "__main__":
    define_options()
    parse_command_line()
    parse_config_file(options.config)

    options.base_url = options.base_url.rstrip('/')
    options.gluu_url = options.gluu_url.rstrip('/')

    GluuOAuth2MixIn.set_api_url(options['gluu_url'], options['oauth2_id'], options['oauth2_secret'])

    settings = {
        'template_path': options.template_path,
        'debug': options.debug,
        'autoescape': None,
        'options': options,
        'xheaders': True,
        'static_path': options.static_path,
    }

    urls = [
        (r"/", tornado.web.RedirectHandler, {"url": "/anyconnect"}),
        (r"/anyconnect/?", AnyConnectHandler),
        (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": options.static_path}),
        (r"/api/v1/check/?", NonceCheck)
    ]
    application = tornado.web.Application(urls, **settings) #type: ignore [arg-type]

    logging.info('Starting server')
    server = tornado.httpserver.HTTPServer(application, xheaders=True)
    server.listen(options.port,options.bind)
    logging.info(f'Listening on : {options.bind}:{options.port} ')
    logging.info(f'Logging : {options.logging} ; Debug : {options.debug}')

    if options.group:
        logging.info(f"Dropping privileges to group: {options.group}/{grp.getgrnam(options.group)[2]}")
        os.setgid(grp.getgrnam(options.group)[2])
    if options.user:
        os.initgroups(options.user,pwd.getpwnam(options.user)[3])
        logging.info(f"Dropping privileges to user: {options.user}/{pwd.getpwnam(options.user)[2]}")
        os.setuid(pwd.getpwnam(options.user)[2])

    tornado.ioloop.IOLoop.instance().start()
