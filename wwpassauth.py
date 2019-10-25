from org.gluu.service.cdi.util import CdiUtil
from org.gluu.oxauth.security import Identity
from org.gluu.model.custom.script.type.auth import PersonAuthenticationType
from org.gluu.oxauth.service import AuthenticationService
from org.xdi.oxauth.service import UserService
from org.gluu.util import StringHelper

from java.util import Arrays
import java

from wwpass import WWPassConnection


class PersonAuthentication(PersonAuthenticationType):
    def __init__(self, currentTimeMillis):
        self.currentTimeMillis = currentTimeMillis
        self.user = None

    def init(self, configurationAttributes):
        print "WWPASS. Initialization"
        self.wwc = WWPassConnection(
            '/opt/wwpass/gluu_client.key', '/opt/wwpass/gluu_client.crt')
        print "WWPASS. Initialized successfully"
        return True

    def destroy(self, configurationAttributes):
        print "WWPASS. Destroy"
        return True

    def getApiVersion(self):
        return 1

    def isValidAuthenticationMethod(self, usageType, configurationAttributes):
        return True

    def getAlternativeAuthenticationMethod(self, usageType, configurationAttributes):
        return None

    def authenticate(self, configurationAttributes, requestParameters, step):
        authenticationService = CdiUtil.bean(AuthenticationService)

        if (step == 1):
            identity = CdiUtil.bean(Identity)
            print "WWPASS. Authenticate for step 1"
            puid = self.wwc.getPUID(requestParameters.get('wwp_ticket')[0])['puid']
            userService = CdiUtil.bean(UserService)
            user = userService.getUserByAttribute("oxExternalUid", "wwpass:%s"%puid)
            if user:
                if authenticationService.authenticate(user.getUserId()):
                    return True
            else:
                identity.setWorkingParameter("puid", puid)
                return True
            return False
        elif (step == 2):
            print "WWPASS. Authenticate for step 2"
            identity = CdiUtil.bean(Identity)
            puid = identity.getWorkingParameter("puid")
            if not puid:
                return False
            credentials = identity.getCredentials()
            user_name = credentials.getUsername()
            user_password = credentials.getPassword()
            logged_in = False
            if (StringHelper.isNotEmptyString(user_name) and StringHelper.isNotEmptyString(user_password)):
                logged_in = authenticationService.authenticate(user_name, user_password)
            if not logged_in:
                return False
            user = authenticationService.getAuthenticatedUser()
            if not user:
                return False
            userService = CdiUtil.bean(UserService)
            userService.addUserAttribute(user_name, "oxExternalUid", "wwpass:%s"%puid)
            return True
        else:
            return False

    def prepareForStep(self, configurationAttributes, requestParameters, step):
        if (step == 1):
            print "WWPASS. Prepare for Step 1"
            return True
        elif (step == 2):
            print "WWPASS. Prepare for Step 2"
            return True
        else:
            return False

    def getExtraParametersForStep(self, configurationAttributes, step):
        return Arrays.asList("puid")

    def getCountAuthenticationSteps(self, configurationAttributes):
        identity = CdiUtil.bean(Identity)
        return 2 if identity.isSetWorkingParameter("puid") else 1

    def getPageForStep(self, configurationAttributes, step):
        return "/auth/wwpass/wwpass.xhtml" if step == 1 else "/auth/wwpass/wwpassbind.xhtml"

    def logout(self, configurationAttributes, requestParameters):
        return True
