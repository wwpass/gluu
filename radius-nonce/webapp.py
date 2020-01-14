import logging
import os
import pwd
import grp
import urllib
import urllib.parse

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
from tornado.options import define, options, parse_config_file, parse_command_line
import tornado.escape

from GluuOIDCClient import GluuOAuth2MixIn

base_path = os.path.abspath(os.path.dirname(__file__))
static_path = os.path.realpath(os.path.join(base_path, './static'))
os.chdir(base_path)


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
                    redirect_uri=f'{self.settings["options"].base_url}/anyconnect/',
                    code=self.get_argument('code'))
                user = await self.get_userinfo(access['access_token'])
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
            self.authorize_redirect(
                redirect_uri=f'{self.settings["options"].base_url}/anyconnect/',
                scope=['openid', 'ro_nonce', 'user_name'],
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

    options.base_url = options.base_url.rstrip('/')
    options.gluu_url = options.gluu_url.rstrip('/')

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
