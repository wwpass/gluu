import logging
import os
import pwd
import grp
import urllib
import urllib.parse
import json
import ssl
from email.utils import parseaddr
from typing import cast, Any, Dict, List, Optional


import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
import tornado.httpclient
from tornado.options import define, options, parse_config_file, parse_command_line
import tornado.escape

from jwt import encode as jwt_encode, decode as jwt_decode, DecodeError
from base64 import decodebytes as base64_decode
from SCIM import SCIMClient


base_path = os.path.abspath(os.path.dirname(__file__))
os.chdir(base_path)

WWPASS_CA_CERT = u'''-----BEGIN CERTIFICATE-----
MIIGATCCA+mgAwIBAgIJAN7JZUlglGn4MA0GCSqGSIb3DQEBCwUAMFcxCzAJBgNV
BAYTAlVTMRswGQYDVQQKExJXV1Bhc3MgQ29ycG9yYXRpb24xKzApBgNVBAMTIldX
UGFzcyBDb3Jwb3JhdGlvbiBQcmltYXJ5IFJvb3QgQ0EwIhgPMjAxMjExMjgwOTAw
MDBaGA8yMDUyMTEyODA4NTk1OVowVzELMAkGA1UEBhMCVVMxGzAZBgNVBAoTEldX
UGFzcyBDb3Jwb3JhdGlvbjErMCkGA1UEAxMiV1dQYXNzIENvcnBvcmF0aW9uIFBy
aW1hcnkgUm9vdCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMmF
pl1WX80osygWx4ZX8xGyYfHx8cpz29l5s/7mgQIYCrmUSLK9KtSryA0pmzrOFkyN
BuT0OU5ucCuv2WNgUriJZ78b8sekW1oXy2QXndZSs+CA+UoHFw0YqTEDO659/Tjk
NqlE5HMXdYvIb7jhcOAxC8gwAJFgAkQboaMIkuWsAnpOtKzrnkWHGz45qoyICjqz
feDcN0dh3ITMHXrYiwkVq5fGXHPbuJPbuBN+unnakbL3Ogk3yPnEcm6YV+HrxQ7S
Ky83q60Abdy8ft0RpSJeUkBjJVwiHu4y4j5iKC1tNgtV8qE9Zf2g5vAHzL3obqnu
IMr8JpmWp0MrrUa9jYOtKXk2LnZnfxurJ74NVk2RmuN5I/H0a/tUrHWtCE5pcVNk
b3vmoqeFsbTs2KDCMq/gzUhHU31l4Zrlz+9DfBUxlb5fNYB5lF4FnR+5/hKgo75+
OaNjiSfp9gTH6YfFCpS0OlHmKhsRJlR2aIKpTUEG9hjSg3Oh7XlpJHhWolQQ2BeL
++3UOyRMTDSTZ1bGa92oz5nS+UUsE5noUZSjLM+KbaJjZGCxzO9y2wiFBbRSbhL2
zXpUD2dMB1G30jZwytjn15VAMEOYizBoHEp2Nf9PNhsDGa32AcpJ2a0n89pbSOlu
yr/vEzYjJ2DZ/TWQQb7upi0G2kRX17UIZ5ZfhjmBAgMBAAGjgcswgcgwHQYDVR0O
BBYEFGu/H4b/gn8RzL7XKHBT6K4BQcl7MIGIBgNVHSMEgYAwfoAUa78fhv+CfxHM
vtcocFPorgFByXuhW6RZMFcxCzAJBgNVBAYTAlVTMRswGQYDVQQKExJXV1Bhc3Mg
Q29ycG9yYXRpb24xKzApBgNVBAMTIldXUGFzcyBDb3Jwb3JhdGlvbiBQcmltYXJ5
IFJvb3QgQ0GCCQDeyWVJYJRp+DAPBgNVHRMBAf8EBTADAQH/MAsGA1UdDwQEAwIB
BjANBgkqhkiG9w0BAQsFAAOCAgEAE46CMikI7378mkC3qZyKcVxkNfLRe3eD4h04
OO27rmfZj/cMrDDCt0Bn2t9LBUGBdXfZEn13gqn598F6lmLoObtN4QYqlyXrFcPz
FiwQarba+xq8togxjMkZ2y70MlV3/PbkKkwv4bBjOcLZQ1DsYehPdsr57C6Id4Ee
kEQs/aMtKcMzZaSipkTuXFxfxW4uBifkH++tUASD44OD2r7m1UlSQ5viiv3l0qvA
B89dPifVnIeAvPcd7+GY2RXTZCw36ZipnFiOWT9TkyTDpB/wjWQNFrgmmQvxQLeW
BWIUSaXJwlVzMztdtThnt/bNZNGPMRfaZ76OljYB9BKC7WUmss2f8toHiys+ERHz
0xfCTVhowlz8XtwWfb3A17jzJBm+KAlQsHPgeBEqtocxvBJcqhOiKDOpsKHHz+ng
exIO3elr1TCVutPTE+UczYTBRsL+jIdoIxm6aA9rrN3qDVwMnuHThSrsiwyqOXCz
zjCaCf4l5+KG5VNiYPytiGicv8PCBjwFkzIr+LRSyUiYzAZuiyRchpdT+yRAfL7q
qHBuIHYhG3E47a3GguwUwUGcXR+NjrSmteHRDONOUYUCH41hw6240Mo1lL4F+rpr
LEBB84k3+v+AtbXePEwvp+o1nu/+1sRkhqlNFHN67vakqC4xTxiuPxu6Pb/uDeNI
ip0+E9I=
-----END CERTIFICATE----- '''

class SCIMHandler(tornado.web.RequestHandler, tornado.auth.OAuth2Mixin): #type: ignore #pylint: disable=abstract-method

    async def get(self) -> None: #pylint: disable=arguments-differ
        import pprint
        #users = await self.settings['scim'].getUsersList()
        users = await self.settings['scim'].getDevicesList()
#        users = await self.settings['scim'].findUsersByAttr('emails.value','d.kondratenko@wwpass.com')
        self.write(f"<pre>{pprint.pformat(users)}</pre>")
        self.finish()

class NewUserHandler(tornado.web.RequestHandler): #type: ignore #pylint: disable=abstract-method
    _wwpass_ssl_context: Optional[ssl.SSLContext] = None
    @staticmethod
    def http() -> tornado.httpclient.AsyncHTTPClient:
        return tornado.httpclient.AsyncHTTPClient()

    def wwpass_ssl_context(self) -> ssl.SSLContext:
        if NewUserHandler._wwpass_ssl_context:
            return NewUserHandler._wwpass_ssl_context
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
        ctx.load_verify_locations(cadata = WWPASS_CA_CERT)
        ctx.load_cert_chain(
            certfile = self.settings['options'].wwpass_client_cert,
            keyfile = self.settings['options'].wwpass_client_key)
        NewUserHandler._wwpass_ssl_context = ctx
        return NewUserHandler._wwpass_ssl_context

    async def post(self) -> None:  #pylint: disable=arguments-differ
        request = self.get_body_argument('request', None)
        if not request:
            raise tornado.web.HTTPError(400, "Bad request")
        try:
            decoded_request = jwt_decode(request, key=self.settings['api_key'])
        except DecodeError:
            raise tornado.web.HTTPError(403, "Invalid request")
        logging.debug(f"Request: {decoded_request}")
        if not all(param in decoded_request for param in ('ticket', 'puid', 'email', 'name')):
            raise tornado.web.HTTPError(400, "Too few request parameters")
        ticket = decoded_request['ticket']
        puid = decoded_request['puid']
        auth_type = 'p' if self.settings['options'].use_pin else ''
        wwpass_request = {
            'ticket': ticket,
            'auth_type': auth_type,
            'finalize': 1
        }
        response = json.loads((await self.http().fetch(f'https://spfe.wwpass.com/put.json?{urllib.parse.urlencode(wwpass_request)}', ssl_options=self. wwpass_ssl_context())).body)
        logging.debug(f"Put ticket response: {response}")
        if 'result' not in response or not response['result']:
            raise tornado.web.HTTPError(403, "Invalid request")
        ticket = response['data']
        request = {
            'ticket': ticket,
            'auth_type': auth_type
        }
        response = json.loads((await self.http().fetch(f'https://spfe.wwpass.com/puid.json?{urllib.parse.urlencode(wwpass_request)}', ssl_options=self. wwpass_ssl_context())).body)
        logging.debug(f"PUID response: {response}")
        if 'result' not in response or not response['result'] or puid != response['data']:
            raise tornado.web.HTTPError(403, "Invalid request")
        self.set_header("Content-type","application/jwt")
        fullname = decoded_request['name']
        email = decoded_request['email']
        errors: List[str] = []
        if not fullname:
            errors.append("Full name is a required parameter")
        if not email:
            errors.append("Email is a required parameter")
        elif parseaddr(email) == ('',''):
            errors.append("Wrong email format")
        elif await self.settings['scim'].findUsersByAttr('emails.value',email):
            #TODO: check for emails with '.' and '+' as identical
            errors.append("This email is already claimed")
        if errors:
            self.write(jwt_encode({
                    'status': 400,
                    'reason': ". ".join(errors),
                    'ticket': ticket},
                algorithm='HS256',
                key=self.settings['api_key']))
            self.finish()
            return

        response = await self.settings['scim'].createUser(
            externalId=f'wwpass:{puid}',
            emails=[{'primary':True, 'value': email}],
            displayName=fullname,
            name={'formatted': fullname},
            userName=f'wwpass-{puid}',
            active=True
        )
        logging.debug(f"CreateUser response: {response}")
        userID = response['id']
        #Redirecting the user to login as if they just authenticated with WWPass
        request = {
            'wwp_version': 2,
            'wwp_status': 200,
            'wwp_reason': 'OK',
            'wwp_ticket': ticket
        }
        loginform_url = f'{self.settings["options"].gluu_url}/oxauth/postlogin.htm?{urllib.parse.urlencode(request)}'
        self.write(jwt_encode({
                'redirect_to': loginform_url,
                'uid': userID},
            algorithm='HS256',
            key=self.settings['api_key']))
        self.finish()


def define_options() -> None:
    define("config",default="/etc/wwpass/oauth2.conf")
    define("template_path",default=os.path.normpath(os.path.join(base_path, 'templates')))

    define("user",default=None)
    define("group",default=None)

    define("debug", type=bool, default=False)
    define("bind", default="0.0.0.0")
    define("port", type=int, default=9062)

    define("gluu_url", type=str)

    define("api_key", type=str)

    define("wwpass_client_cert", type=str)
    define("wwpass_client_key", type=str)
    define("use_pin", type=bool, default=False)

    define("uma2_id", type=str)
    define("uma2_secret", type=str)
    define("uma2_kid", type=str)


urls = [
    (r"/v1/user/?", NewUserHandler),
    #(r"/scim/?", SCIMHandler),
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
        'api_key': base64_decode(options.api_key.encode('ascii')),
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
