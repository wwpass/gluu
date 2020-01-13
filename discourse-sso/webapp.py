import logging
import os
import pwd
import grp
import json
import base64
import urllib.parse

import hmac
import hashlib

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
from tornado.options import define, options, parse_config_file, parse_command_line
from tornado.httputil import url_concat

from GluuOIDCClient import GluuOAuth2MixIn

base_path = os.path.abspath(os.path.dirname(__file__))
static_path = os.path.realpath(os.path.join(base_path, './static'))
os.chdir(base_path)

class SSOHandler(tornado.web.RequestHandler, GluuOAuth2MixIn): #type: ignore #pylint: disable=abstract-method
    """
    Handler for AnyConnect login
    """
    async def get(self) -> None: #pylint: disable=arguments-differ
        if self.get_argument('error', False):
            self.render('error.html',reason=self.get_argument('error'))
            return
        if self.get_argument('code', False):
            try:
                access = await self.get_authenticated_user(
                    redirect_uri=f'{self.settings["options"].base_url}sso/',
                    code=self.get_argument('code'))
                userinfo = await self.get_userinfo(access['access_token'])
                logging.debug(f"Userinfo: {userinfo}")
            except Exception:
                logging.exception("Exception in OIDC")
                self.render('error.html',reason="Access denied")
                return
            try:
                sso_request, sso_signature = json.loads(self.get_argument('state'))
                if hmac.new(self.settings["options"].discourse_secret, sso_request.encode(), digestmod = hashlib.sha256).hexdigest() != sso_signature.lower():
                    raise AttributeError("Incorrect SSO signature")
                sso_request_params = urllib.parse.parse_qs(base64.decodebytes(sso_request.encode()))
                nonce = sso_request_params[b'nonce'][0]
                return_url = sso_request_params[b'return_sso_url'][0]
                groups = userinfo.get("member_of", ())
                sso_reply = {
                    'nonce': nonce,
                    'email': userinfo['email'],
                    'external_id': userinfo['inum'],
                    'name': userinfo['name'],
                    'admin': "true" if f'inum={self.settings["options"].admins_group_inum},ou=groups,o=gluu' in groups else "false",
                    'moderator':  "true" if f'inum={self.settings["options"].moderators_group_inum},ou=groups,o=gluu' in groups else "false"
                }
                encoded_payload = base64.encodebytes(urllib.parse.urlencode(sso_reply).encode()).replace(b'\n',b'')
                signature = hmac.new(self.settings["options"].discourse_secret, encoded_payload, digestmod = hashlib.sha256).hexdigest()
                self.redirect(
                    url_concat(return_url.decode(), {'sso': encoded_payload.decode(), 'sig': signature}))

            except Exception:
                logging.exception("Exception in SSO")
                self.render('error.html',reason="Bad SSO request")
                return
        else:
            sso_request = self.get_argument('sso', False)
            sso_signature = self.get_argument('sig', False)
            if not (sso_request and sso_signature):
                self.render('error.html',reason="Bad SSO request")
                return
            self.authorize_redirect(
                redirect_uri=f'{self.settings["options"].base_url}sso/',
                scope=['openid', 'profile', 'email'],
                response_type='code',
                state=(sso_request, sso_signature))

def define_options() -> None:
    define("config",default="/etc/wwpass/oauth2.conf")
    define("template_path",default=os.path.normpath(os.path.join(base_path, 'templates')))

    define("user",default=None)
    define("group",default=None)

    define("debug", type=bool, default=False)
    define("bind", default="0.0.0.0")
    define("port", type=int, default=9063)
    define("base_url", type=str)

    define("gluu_url", type=str)
    define("oauth2_id", type=str)
    define("oauth2_secret", type=str)
    define("discourse_secret", type=bytes)
    define("admins_group_inum", type=str)
    define("moderators_group_inum", type=str)

urls = [
    (r"/", tornado.web.RedirectHandler, {"url": "/sso/"}),
    (r"/sso/?", SSOHandler),
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
