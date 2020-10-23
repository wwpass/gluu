# gluu-wwpass

WWPass integration with GLUU IAM service

## TODO
 - If at all possible intergate getTicket in the oxAuth
 - Secure SP key file with better permissions/ownership
 - Properly fix WWPass SDK for it to work with Jython 2.7.1
 - Assert that registering the same user in parallel won't introduce vulnerability
 - Recover an account using email

## Installation

To install WWPass supprot in Gluu server refer to [INSTALLATION.md](INSTALLATION.md).

To install additional components refer to their README.md files:
 - [VPN with WWPass](vpn/README.md)
 - [Discourse SSO](discourse-sso/README.md)
 - [API for user manipulation](api/README.md)
 - [SSO homepage](nomepage/README.md)
 - [Automatic SSO](AUTO_SSO.md)

## Contacts

Feel free to contact WWPass at support@wwpass.com if you have trouble integrating WWPass in your Gluu setup