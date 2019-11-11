# gluu-wwpass

WWPass integration with GLUU IAM service

## TODO
 - Make location for client cert/key configurable
 - If at all possible intergate getTicket in the oxAuth
 - Secure SP key file with better permissions/ownership
 - Properly fix WWPass SDK for it to work with Jython 2.7.1
 - Maybe use https client service form inside Gluu
 - Revise texts for WWPass pages
 - Fix logo on binding page
 - Assert that registering the same user in parallel won't introduce vulnerability
 - Bind additional keys using existing key
 - Make anyconnect OAuth2client use more secure authentication method
 - Recover an account using email

## Instuctions

### File deployment
`wwpass-frontend.js`, `wwpass.xhtml` and `wwpassbind.xhtml` to `/opt/gluu-server/opt/jetty-9.4/temp/jetty-localhost-8081-oxauth.war-_oxauth-any-<instance_number>.dir/webapp/auth/wwpass/` . Don't forget to `mkdir` first.

`wwpass.py` to `/opt/gluu-server/opt/gluu/python/libs/`

`wwpassauth.py` to `/opt/gluu-server/opt/wwpass_gluu/`.

`ticket.json` to `/opt/gluu-server/opt/wwpass_gluu/cgi`. Make the file executable.

SP certificate and key to: `/opt/wwpass_gluu/gluu_client.crt` and `/opt/wwpass_gluu/gluu_client.key`.

### Configuration

#### Configuration -> Manage Custom scripts

Create custom script `wwpass` with "File" storage and path to `wwpassauth.py` from above (excluding `/opt/gluu/`)

Add the following parameters to the script:
 - `wwpass_crt_file`: location of SP certificate file: `/opt/wwpass_gluu/gluu_client.crt`
 - `wwpass_key_file`: location of SP private key file: `/opt/wwpass_gluu/gluu_client.key`
 - `registration_url`: URL of registration web application: `https://connect.warca.net/newuser` (see: [Registration](registration//README.md))
 - `allow_password_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using username and password

Don't forget to enable it.

#### Configuration -> Manage Authentication -> Default Authentication Method

Set both options to "wwpass".

#### Apache config for getticket script

Add the following to site configuration:
```
<Location /wwpass>
  require all granted
</Location>

ScriptAlias "/wwpass/" "/opt/wwpass_glue/cgi/"

<Directory /opt/wwpass_glue/cgi/>
SetHandler cgi-script
Options +ExecCGI
        Order deny,allow
        Allow from all
</Directory>
```

Reload apache2 after that.