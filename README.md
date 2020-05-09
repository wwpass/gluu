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
N.B. Some of the files are relative symlinks. When deploying make sure to copy file contents not the symlinks themselves.

Files in `oxauth` directory should be deployed to : `/opt/gluu-server/opt/gluu/jetty/oxauth/custom/`.

Files in `oxtrust` directory should be deployed to `/opt/gluu-server/opt/gluu/jetty/identity/custom/`.

Files in `idp` directory should be deployed to `/opt/gluu-server/opt/gluu/jetty/idp/custom/`.

`wwpass.py` to `/opt/gluu-server/opt/gluu/python/libs/`

`ticket.json` to `/opt/gluu-server/opt/wwpass_gluu/cgi`. Make the file executable.

`wwpass.ca.crt` to `/opt/gluu-server/opt/wwpass_gluu/wwpass.ca.crt`.

SP certificate and key to: `/opt/gluu-server/opt/wwpass_gluu/gluu_client.crt` and `/opt/gluu-server/opt/wwpass_gluu/gluu_client.key`.

`wwpass.ca.crt` to `/opt/gluu-server/opt/wwpass_gluu/`

### Gluu Configuration

#### Interception scripts
In Gluu Admin interface navigate to: "Configuration -> Manage Custom scripts"

Under "Person Authentication" tab, click "Add custom script configuration"

Create custom script `wwpass` with "Database" storage.

Paste contents of `wwpassauth.py` to "Script" textbox.

Add the following parameters to the script:
 - `wwpass_crt_file`: location of SP certificate file: `/opt/wwpass_gluu/gluu_client.crt`
 - `wwpass_key_file`: location of SP private key file: `/opt/wwpass_gluu/gluu_client.key`
 - `registration_url`: URL of registration web application, if you have one
 - `recovery_url`: URL for account recovery, if you have one
 - `allow_password_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using username and password
 - `allow_passkey_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using another PassKey
  - `use_pin`: Nonempty value will require PIN to log in

Don't forget to enable the custom script.

#### Authentication method

Before switching to WWPass authentication make sure you have administrator session in a browser. Don't close this session until you are sure that authentication is working, or you might lock yoursel out of Gluu. If that happens, refer to: https://gluu.org/docs/gluu-server/operation/faq/#revert-an-authentication-method

In Gluu Admin interface navigate to: "Configuration -> Manage Authentication -> Default Authentication Method"

Set both options to "wwpass".

#### Apache config for getticket script

Add the following to site configuration at `/opt/gluu-server/etc/apache2/sites-available/https_gluu.conf` after other `<Location>` sections:
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

Enable CGI moulde for apache:
```
# a2enmod cgi
```

Restart apache2 after that:
```
# systemctl restart apache2
```

#### Layouts, styles, images origin repo
You can find all originals and implementation instructions for the xhtml, images and css in this repo:
https://gitlab.wwpass.net/Igor.Vladimirskiy/gluulego
