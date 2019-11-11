from org.gluu.model.custom.script.type.owner import ResourceOwnerPasswordCredentialsType
from org.gluu.oxauth.service import UserService
from org.gluu.service.cdi.util import CdiUtil

import java
import time


class ResourceOwnerPasswordCredentials(ResourceOwnerPasswordCredentialsType):
    def __init__(self,currentTimeMillis):
        self.currentTimeMillis = currentTimeMillis

    def init(self, configurationAttributes):
        print("Radius nonce check Init")
        return True

    def destroy(self, configurationAttributes):

        print("Radius nonce check. Destroy")
        return True

    def getApiVersion(self):
        return 1

    def authenticate(self, context):
        username = context.getHttpRequest().getParameter("username")
        userService = CdiUtil.bean(UserService)
        user = userService.getUser(username,"RadiusNonce")
        if user == None:
            print("Radius nonce check. User '%s' not found" % username)
            return False
        nonceAttribute = userService.getCustomAttribute(user, "RadiusNonce")
        if not nonceAttribute:
            print("Radius nonce check. User '%s' has no nonce" % username)
            return False
        nonceAttribute = nonceAttribute.getValue()
        userService.removeUserAttribute(user.getUserId(),"RadiusNonce", nonceAttribute)
        userNonce, expires = nonceAttribute.split(':')
        if float(expires) < time.time():
            print("Radius nonce check. Nonce has expired for user '%s'" % username)
            return False
        nonce = context.getHttpRequest().getParameter("__password")
        if nonce == userNonce:
            context.setUser(user)
            print("Radius nonce check. User '%s' authenticated with nonce" % username)
            return True
        return False
