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

class BaseHandler(tornado.web.RequestHandler):
    def get_available_services(self, userinfo: Dict[str,Any]) -> Tuple[str, ...]:
        groups = cast(Sequence[str], userinfo.get("member_of", ()))
        logging.debug(f"Groups: {groups}")
        ret = tuple(service for service in self.settings['options'].services if 'groups' not in service or any(group in groups for group in service['groups']))
        logging.debug(f"Services: {ret}")
        return ret

class HomeHandler(BaseHandler, GluuOAuth2MixIn): #pylint: disable=abstract-method
    """
    Handler for Home page
    """
    def get_template_namespace(self) -> Dict[str, Any]:
        ns = super().get_template_namespace()
        ns['options'] = self.settings['options']
        return ns

    async def get(self) -> None: #pylint: disable=arguments-differ
        if self.get_argument('error', False): #type: ignore
            self.render('error.html',reason=self.get_argument('error'))
            return
        if self.get_argument('code', False): #type: ignore
            try:
                access = await self.get_authenticated_user(
                    redirect_uri=f'{self.settings["options"].base_url}/',
                    code=self.get_argument('code'))
                user = await self.get_userinfo(access['access_token'])
            except Exception:
                self.render('error.html',reason="Access denied")
                return
            logging.debug(f"Got userinfo: {user}")
            self.render('home.html',
                ticket='redirect',
                userinfo = user,
                services = self.get_available_services(user),
                gluu_url = self.settings["options"].gluu_url,
                base_url = self.settings["options"].base_url)
        else:
            self.authorize_redirect(
                redirect_uri=f'{self.settings["options"].base_url}/',
                scope=['openid', 'profile'],
                response_type='code')

def define_options() -> None:
    define("config",default="/etc/wwpass/gluu_homepage.conf")
    define("template_path",default=os.path.normpath(os.path.join(base_path, 'templates')))
    define("static_path",default=os.path.realpath(os.path.join(base_path, './static/wwpass')))

    define("title", type=str, default='WWPass')

    define("user",default=None)
    define("group",default=None)

    define("debug", type=bool, default=False)
    define("bind", default="0.0.0.0")
    define("port", type=int, default=9070)
    define("base_url", type=str)

    define("gluu_url", type=str)
    define("oauth2_id", type=str)
    define("oauth2_secret", type=str)

    define("services", type=list)

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
        (r"/", HomeHandler),
        (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": options.static_path}),
        (r"/.*", tornado.web.RedirectHandler, {"url": "/"})
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
