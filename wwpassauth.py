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
        self.allow_password_bind = configurationAttributes.get("allow_password_bind").getValue2() if configurationAttributes.containsKey("allow_password_bind") else None
        self.allow_passkey_bind = configurationAttributes.get("allow_passkey_bind").getValue2() if configurationAttributes.containsKey("allow_passkey_bind") else None
        self.registration_url = configurationAttributes.get("registration_url").getValue2() if configurationAttributes.containsKey("registration_url") else None
        self.recovery_url = configurationAttributes.get("recovery_url").getValue2() if configurationAttributes.containsKey("recovery_url") else None
        self.wwc = WWPassConnection(
            configurationAttributes.get("wwpass_key_file").getValue2(),
            configurationAttributes.get("wwpass_crt_file").getValue2())
        self.use_pin = configurationAttributes.get("use_pin").getValue2() if configurationAttributes.containsKey("use_pin") else None
        self.auth_type = ('p',) if self.use_pin else ()
        print "WWPASS. Initialized successfully"
        return True

    def destroy(self, configurationAttributes):
        print "WWPASS. Destroy"
        return True

    def getApiVersion(self):
        return 2

    def isValidAuthenticationMethod(self, usageType, configurationAttributes):
        return True

    def getAlternativeAuthenticationMethod(self, usageType, configurationAttributes):
        return None

    def tryFirstLogin(self, puid, userService, authenticationService): # Login user that was just registered via external link
        user = userService.getUserByAttribute("oxTrustExternalId", "wwpass:%s"%puid)
        if user and authenticationService.authenticate(user.getUserId()):
                userService.addUserAttribute(user.getUserId(), "oxExternalUid", "wwpass:%s"%puid)
                userService.removeUserAttribute(user.getUserId(),"oxTrustExternalId", "wwpass:%s"%puid)
                return True
        return False

    def getPuid(self, ticket):
        puid = self.wwc.getPUID(ticket, self.auth_type)['puid']
        assert puid #Just in case it's empty or None
        return puid

    def authenticate(self, configurationAttributes, requestParameters, step):
        authenticationService = CdiUtil.bean(AuthenticationService)
        userService = CdiUtil.bean(UserService)
        ticket = requestParameters.get('wwp_ticket')[0] if 'wwp_ticket' in requestParameters else None
        identity = CdiUtil.bean(Identity)
        identity.setWorkingParameter("errors", "")
        if (step == 1):
            print "WWPASS. Authenticate for step 1"
            puid = self.getPuid(ticket)
            user = userService.getUserByAttribute("oxExternalUid", "wwpass:%s"%puid)
            if user:
                if authenticationService.authenticate(user.getUserId()):
                    return True
            else:
                if self.registration_url and self.tryFirstLogin(puid, userService, authenticationService):
                    return True
                identity.setWorkingParameter("puid", puid)
                identity.setWorkingParameter("ticket", ticket)
                return True
            return False
        elif (step == 2):
            print "WWPASS. Authenticate for step 2"
            puid = identity.getWorkingParameter("puid")
            if not puid:
                identity.setWorkingParameter("errors", "WWPass login failed")
                return False
            if ticket:
                puid_new = self.getPuid(ticket)
                # Always use the latest PUID when retrying step 2
                identity.setWorkingParameter("puid", puid_new)
                if puid == puid_new:
                    # Registering via external web service
                    if not self.registration_url:
                        return False
                    if self.tryFirstLogin(puid, userService, authenticationService):
                        identity.setWorkingParameter("puid", None)
                        return True
                else:
                    if not self.allow_passkey_bind:
                        return False
                    # Binding with existing PassKey
                    user = userService.getUserByAttribute("oxExternalUid", "wwpass:%s"%puid_new)
                    if user:
                        if authenticationService.authenticate(user.getUserId()):
                            userService.addUserAttribute(user.getUserId(), "oxExternalUid", "wwpass:%s"%puid)
                            identity.setWorkingParameter("puid", None)
                            return True
                    identity.setWorkingParameter("errors", "Invalid user")
                    return False
            else:
                # Binding via username/password
                if not self.allow_password_bind:
                    return False
                credentials = identity.getCredentials()
                user_name = credentials.getUsername()
                user_password = credentials.getPassword()
                logged_in = False
                if (StringHelper.isNotEmptyString(user_name) and StringHelper.isNotEmptyString(user_password)):
                    logged_in = authenticationService.authenticate(user_name, user_password)
                if not logged_in:
                    identity.setWorkingParameter("errors", "Invalid username or password")
                    return False
                user = authenticationService.getAuthenticatedUser()
                if not user:
                    identity.setWorkingParameter("errors", "Invalid user")
                    return False
                userService.addUserAttribute(user_name, "oxExternalUid", "wwpass:%s"%puid)
                identity.setWorkingParameter("puid", None)
                return True
            return False
        else:
            return False

    def prepareForStep(self, configurationAttributes, requestParameters, step):
        identity = CdiUtil.bean(Identity)
        identity.setWorkingParameter("use_pin", bool(self.use_pin))
        if (step == 1):
            print "WWPASS. Prepare for Step 1"
            return True
        elif (step == 2):
            identity.setWorkingParameter("registration_url", self.registration_url)
            identity.setWorkingParameter("recovery_url", self.recovery_url)
            identity.setWorkingParameter("allow_password_bind", self.allow_password_bind)
            identity.setWorkingParameter("allow_passkey_bind", self.allow_passkey_bind)
            print "WWPASS. Prepare for Step 2 errors:%s" % identity.getWorkingParameter("errors")
            return True
        return False

    def getExtraParametersForStep(self, configurationAttributes, step):
        return Arrays.asList("puid", "ticket", "use_pin", "errors")

    def getCountAuthenticationSteps(self, configurationAttributes):
        identity = CdiUtil.bean(Identity)
        return 2 if identity.isSetWorkingParameter("puid") else 1

    def getPageForStep(self, configurationAttributes, step):
        return "/auth/wwpass/wwpass.xhtml" if step == 1 else "/auth/wwpass/wwpassbind.xhtml"

    def logout(self, configurationAttributes, requestParameters):
        return True

    def getNextStep(self, configurationAttributes, requestParameters, step):
        # If user not pass current step change step to previous
        identity = CdiUtil.bean(Identity)
        puid = identity.getWorkingParameter("puid")
        if puid and step != 1:
            print "WWPass. Get next step. Retrying step 2"
            return 2
        return -1