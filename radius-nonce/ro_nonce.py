from com.google.common.io import BaseEncoding
from org.gluu.model.custom.script.type.scope import DynamicScopeType
from org.gluu.service.cdi.util import CdiUtil
from org.gluu.oxauth.service import UserService, UserGroupService
from java.security import SecureRandom

import jarray
import time

import java
from java.util import Arrays

class DynamicScope(DynamicScopeType):
    NONCE_LENGTH=32
    NONCE_TTL=20 #Seconds

    def __init__(self, currentTimeMillis):
        self.currentTimeMillis = currentTimeMillis

    def init(self, configurationAttributes):
        print("RO Dynamic scope. Initialization")
        self.groupDN = configurationAttributes.get("groupDN").getValue2() if configurationAttributes.containsKey("groupDN") else None

        return True

    def destroy(self, configurationAttributes):
        print("RO Dynamic scope. Destroy")
        return True

    @staticmethod
    def generateNonce(keyLength):
        bytes = jarray.zeros(keyLength, "b")
        secureRandom = SecureRandom()
        secureRandom.nextBytes(bytes)
        return BaseEncoding.base64().omitPadding().encode(bytes)

    def update(self, dynamicScopeContext, configurationAttributes):
        print("RO Dynamic scope. Update method")
        dynamicScopes = dynamicScopeContext.getDynamicScopes()
        authorizationGrant = dynamicScopeContext.getAuthorizationGrant()
        user = dynamicScopeContext.getUser()
        userService = CdiUtil.bean(UserService)
        if self.groupDN:
            print("Checking user to be in group: %s" % self.groupDN)
            groups = userService.getCustomAttribute(user, "memberOf").getValues()
            if not self.groupDN in groups:
                print("User %s is not in group: %s" % (user.getDn(), self.groupDN))
                return False
        jsonWebResponse = dynamicScopeContext.getJsonWebResponse()
        claims = jsonWebResponse.getClaims()
        nonce = self.generateNonce(self.NONCE_LENGTH)
        claims.setClaim("ro_nonce", nonce)
        userService.setCustomAttribute(user, "RadiusNonce", "%s:%f"%(nonce, time.time() + self.NONCE_TTL))
        userService.updateUser(user)
        return True

    def getSupportedClaims(self, configurationAttributes):
        return Arrays.asList("ro_nonce")

    def getApiVersion(self):
        return 2
