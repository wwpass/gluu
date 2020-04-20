# gluu-wwpass

WWPass integration with GLUU IAM service

## TODO
 - If at all possible intergate getTicket in the oxAuth
 - Secure SP key file with better permissions/ownership
 - Properly fix WWPass SDK for it to work with Jython 2.7.1
 - Assert that registering the same user in parallel won't introduce vulnerability
 - Recover an account using email

## Instuctions

### File deployment
Files in `oxauth` directory should be deployed to : `/opt/gluu-server/opt/gluu/jetty/oxauth/custom/`.

Files in `oxtrust` directory should be deployed to `/opt/gluu-server/opt/gluu/jetty/identity/custom/`.

Files in `idp` directory should be deployed to `/opt/gluu-server/opt/gluu/jetty/idp/custom/`.

`wwpass.py` to `/opt/gluu-server/opt/gluu/python/libs/`

`ticket.json` to `/opt/gluu-server/opt/wwpass_gluu/cgi`. Make the file executable.

SP certificate and key to: `/opt/gluu-server/opt/wwpass_gluu/gluu_client.crt` and `/opt/gluu-server/opt/wwpass_gluu/gluu_client.key`.

### Configuration

#### Configuration -> Manage Custom scripts

Create custom script `wwpass` with "Database" storage and contents of `wwpassauth.py`.

Add the following parameters to the script:
 - `wwpass_crt_file`: location of SP certificate file: `/opt/wwpass_gluu/gluu_client.crt`
 - `wwpass_key_file`: location of SP private key file: `/opt/wwpass_gluu/gluu_client.key`
 - `registration_url`: URL of registration web application: `https://connect.warca.net/newuser` (see: [Registration](registration//README.md))
 - `recovery_url`: URL for account recovery
 - `allow_password_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using username and password
 - `allow_passkey_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using another PassKey
  - `use_pin`: Nonempty value will require PIN to log in

Don't forget to enable it.

#### Configuration -> Manage Authentication -> Default Authentication Method

Set both options to "wwpass".

#### Apache config for getticket script

Add the following to site configuratio at `/opt/gluu-server/etc/apache2/sites-available/https_gluu.conf`:
```
<Location /wwpass>
  require all granted
</Location>

ScriptAlias "/wwpass/" "/opt/wwpass_gluu/cgi/"

<Directory /opt/wwpass_gluu/cgi/>
  SetHandler cgi-script
  Options +ExecCGI
  Order deny,allow
  Allow from all
</Directory>
```

Reload apache2 after that.

#### Layouts, styles, images origin repo
You can find all originals and implementation instructions for the xhtml, images and css in this repo:
https://gitlab.wwpass.net/Igor.Vladimirskiy/gluulego