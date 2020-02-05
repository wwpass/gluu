# Web application for user self-registration in Gluu with WWPass PassKey

This web application allows user self-registration in Gluu with WWPass PassKey and without usernames and passwords. It uses SCIM API with UMA2 authentication to add user to Gluu database.

## How it works
1. The user authenticates with a PassKey that is not bound to any account in Gluu.
2. A WWPass custom authentication script displays a registration/binding page. If `registration_url` is configured in script parameters, a registration button is displayed. It's part of a form that has WWPass ticket and PUID of the user in hidden fields.
3. The user clicks on the button and is sent to the registration web application with POST request.
4. The registration application displays a web form to the user with the ticket and PUID in hidden fields. The form should have an additional JavaScript snipped that displays countdown timer for the ticket expiration.
5. The user fills in the from and submits it.
6. The registration application validates user input and sends JWT request to WARCA API POST: /v1/user/.
7. The api application requests new ticket form the one it received, finalizing the received ticket.
8. The api application requests PUID with the new ticket and asserts that it's equal to the PUID received from the request.
9. The api issues SCIM request to Gluu to create new user. New username is "wwpass-&lt;puid&gt;". "externalID" is set to "wwpass:&lt;puid&gt;" it maps to "OxTrustExternalId" in Gluu LDAP.
10. The api replies with "inum" of new user and redirect location to the registration application .
11. The registration application redirects the user back to the login page using the URL from the api
12. The WWPass custom authentication script retrieves PUID using the ticket, then searches for the user with corresponding "OxTrustExternalId" attribute. If the user is found, it's authenticated in Gluu, "OxTrustExternalId" attribute is removed and an "oxExternalUid" attribute with value "wwpass:&lt;puid&gt;" as a normal binding.
13. If step 11 (redirect) fails, the next time the user authenticates, step 12 is performed during normal authentication process before step 2 (display the registration/binding page).

## Installation and configuration

It's assumed that Gluu is running and WWPass authentication is configured (see [WWPass authentication in Gluu](../README.md)).

### Gluu configuration
1. Enable SCIM in UMA2 mode (see [Gluu docs](https://gluu.org/docs/ce/user-management/scim2/#protection-using-uma)):
    1. Go to `Configuration -> Organization Configuration` and choose "enabled" for the `SCIM support` property;
    2. Go to `Configuration -> Manage Custom Scripts`, and in the tab for `UMA RPT policies` check "Enabled" for the script labeled "scim_access_policy". Finally press the "Update" button
2. Go to `OpenID Connect -> Clients -> SCIM Requesting Party Client`. Note the `Client ID` value.
3. From there go to `Encryption/Signing settings` tab, and in `JWKS` field find a key that has `kid` field ending in "_sig_rs256". Note that `kid` value.
4. Extract the corresponding private key:
    1. Login to gluu server console
    2. Extract the key to pkcs12 format: `keytool -importkeystore -srckeystore /install/community-edition-setup/output/scim-rp.jks -srcstorepass secret -srcalias &lt;kid&gt; -destalias &lt;kid&gt; -deststoretype PKCS12 -deststorepass password -destkeypass password -destkeystore identity.p12`
    3. Convert the private key to PEM fromat: `openssl pkcs12 -in identity.p12 -nodes -nocerts -out private_key.pem`
    4. Keep the contents of `private_key.pem`, delete the file and `identity.p12` file.
5. Go to `Configuration -> Manage Custom Scripts`, and in the tab for `Person Authentication` in `wwpass` script add `registration_url` parameter with value "https://&lt;registration_webapp_root&gt;/newuser"

### Registration webapp
1. Deploy `webapp.py`, `SCIM.py` and `templates/` to a directory on a web server
2. Copy `webapp.conf.example` to the web server and rename it to `webapp.conf`
3. Edit `webapp.conf`, filling values relevant to your system:
    1. `gluu_url`: URL of the Gluu installation
    2. `wwpass_client_cert` and `wwpass_client_key`: a client certificate and a private key file for WWPass API
    3. `use_pin`: thist setting should be True if and only if the PIN is used for WWPass authentiation in Gluu
    4. `uma2_id`: Client ID from step 2 in [Gluu configuration](#Gluu-configuration)
    5. `uma2_kid`: `kid` from step 3 in [Gluu configuration](#Gluu-configuration)
    6. `uma2_secret`: Contents of `private_key.pem` from step 4.4 in [Gluu configuration](#Gluu-configuration)
    7. `api_key`: Generate random 32 byte key using secure RNG and base64 encode it
    8. `managed_groups`: Tuple of group Inum's. These groups could be managed by API all other groups are not exposed
4. Configure your web server to run `webapp.py --config=webapp.conf` as a demon
5. Install python modules for the webapp: "python3-tornado", "python3-jwt"
6. Configure your web server software to proxy requests for relevant virtual host to this helper webapp

## API reference

### /v1/user

#### POST
Create new user.
Request is form-encoded with a single field:
```
 request=JWT.encode({
                'ticket':<ticket>,
                'puid':<puid>,
                'email':<email>,
                'name':<Full Name>},
            algorithm='HS256',
            key=<api_key>)
```
Reply:

On success
```
 JWT.encode({
     'redirect_to':<url>,
     'uid':<gluu_user_id>},
            algorithm='HS256',
            key=<api_key>)
```

On error
```
 JWT.encode({
     'ticket':<new_ticket>,
     'reason':<error message>,
     'status':<error_code>},
            algorithm='HS256',
            key=<api_key>)
```

### /v1/user/{user_id}/group/{group_id}

Manage group membership. Only groups defined in configuration can be managed.

#### POST

Add user to group

Request is form-encoded with a single field:
```
 request=JWT.encode({
                'user':<userInum>,
                'group':<groupInum>,
                'member': True},
            algorithm='HS256',
            key=<api_key>)
```

On success: 
```
 JWT.encode({ 'success': True }
            algorithm='HS256',
            key=<api_key>)
```

#### DELETE

Remove user from group

Request is form-encoded with a single field:
```
 request=JWT.encode({
                'user':<userInum>,
                'group':<groupInum>,
                'member': False},
            algorithm='HS256',
            key=<api_key>)
```

On success: 
```
 JWT.encode({ 'success': True }
            algorithm='HS256',
            key=<api_key>)
```