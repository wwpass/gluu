# Enabling WWPass authentication in Gluu

## Introduction

[WWPass technology](https://wwpass.com/) provides easy and secure way to authenticate users in any environment. It replaces traditional approach with usernames and passwords with more secure easy-to-use authentication mechanisms, based on strong cryptography using hardware tokens or smartphone apps. [Gluu](https://gluu.org) is an access management system that combines LDAP, OpenID Connect, RADIUS and other technologies to allow single sign on with multiple applications. Combining strong WWPass authentication with versatility of Gluu allows one to have various application to authenticate users securely with standard protocols like OpenID Connect.

## Prerequisites

This tutorial assumes that you have:
- Running Gluu server v. 4.x
- Administative account on that server
- A client certificate and a private key file for WWPass
- WWPass Key as a moblie app or hardware token
- Basic knowledge of HTML and CSS

TODO: Put links on gluu setup and WWPass self-serivce

## Preparing the files

Download the pages and scripts from Github [https://github.com/wwpass/gluu](https://github.com/wwpass/gluu):
```
$ git clone REPO URL
```

Copy `oxauth/`, `wwpass.py`, `wwpass.ca.crt` and `ticket.json` to your Gluu server:
```
$ cd REPO DIR
$ scp -r oxauth/ wwpass.py wwpass.ca.crt ticket.json <username>@<gluu_server_host>:
```

Copy your client certificate and private key file for WWPass to your Gluu server:
```
$ scp <path_to_crt_file> <path_to_key_file> <username>@<gluu_server_host>:
```

## Installing the files

SSH to your Gluu server:
```
$ ssh <username>@<gluu_server_host>:
```

`oxauth/` directory contains files that will become part of "oxAuth" part of Gluu server. We need to incorporate them in `oxauth.war` archive (which is just a ZIP archive):
```
$ sudo cp /opt/gluu-server/opt/gluu/jetty/oxauth/webapps/oxauth.war .
$ sudo cp oxauth.war oxauth.war.backup
$ cd oxauth/
$ sudo zip -ur ../oxauth.war ./*
$ sudo cp ../oxauth.war /opt/gluu-server/opt/gluu/jetty/oxauth/webapps/
$ cd ..
```

For WWPass authentication we would need a simple server endpoint to provide WWPass tickets to a front-end. This will be done by a `ticket.json` bash script via CGI:
```
$ sudo mkdir -p /opt/gluu-server/opt/wwpass_gluu/cgi
$ sudo cp wwpass.ca.crt <crt_file> <key_file> /opt/gluu-server/opt/wwpass_gluu/
$ sudo cp ticket.json /opt/gluu-server/opt/wwpass_gluu/cgi
$ sudo chmod 755 /opt/gluu-server/opt/wwpass_gluu/cgi/ticket.json
```

Custom scripts inside Gluu will need WWPass Python library:
```
$ sudo cp wwpass.py /opt/gluu-server/opt/gluu/python/libs/
```

Now all the files are ready, we have to make the server use them!

## Configuring the server

First, use your favorite console editor to change Apache configuration:
```
$ sudo <vi|nano|joe|...> /opt/gluu-server/etc/apache2/sites-available/https_gluu.conf
```

Scroll down the file until you find the last `<Location>...</Location>` tag, insert the following snippet after it:
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

Save the file and exit the editor.

We now have to restart both Apache and oxAuth to apply the changes we made.

Login int gluu-server VM:
```
$ sudo gluu-serverd login
```

And restart them:

```
# systemctl reload apache2
# systemctl restart oxauth
# exit
```

We are almost there. Check that `ticket.json` is working. Go to "https://<your_gluu_host>/wwpass/ticket.json". If your setup is correct you'll see something like that:
```
{"result": true, "data": "SPNAME:07629a1963c5e4f4f339ecb852b7a0bf10a90c62@p-sp-05-50:16033", "ttl": 600, "encoding": "plain"}
```

Finally it's time to configure the Gluu server. Login as administrator and go to "Configuration -> Manage Custom scripts"

Click "Add custom script configuration".

Fill the parameters as follows:
- Name: "wwpass"
- Description: "WWPass authentication"
- Location Type: "Database"
- INTERACTIVE: "Web"
- Script: Copy contents of `wwpassauth.py` file from REPO URL
- Enabled: Check

Click "Add new property" 7 times and fill in the following properties:
 - `wwpass_crt_file`: location of SP certificate file: `/opt/wwpass_gluu/<crt_file>`
 - `wwpass_key_file`: location of SP private key file: `/opt/wwpass_gluu/<key_file>`
 - `registration_url`: URL of registration web application !!!!! HOW WE REGISTER USERS IN SUCH SETUP !!!
 - `recovery_url`: URL for users to initiate account recovery.
 - `allow_password_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using username and password
 - `allow_passkey_bind`: Add this parameter with any non-empty value if you would like to enable binding WWPass PassKey to an account using another PassKey
  - `use_pin`: Nonempty value will require PIN to log in

Click "Update" to save the custom script. It should be highlighted green afterwards.

The last step is to instruct Gluu to use WWPass authentication script we just made.

Go to "Configuration -> Manage Authentication -> Default Authentication Method". Set both "Default acr" and "oxTrust acr" to "wwpass" and click "Update".

Don't logout from this Gluu session. Open another browser or incognito window and try authenticating with Gluu. If your setup is working you'll see WWPass authentication page with QRCode. If something goes wrong, you can revert settings in "Configuration -> Manage Authentication -> Default Authentication Method" back to "auth_ldap_server" so that you'll not lock youself out.

If you still do that, follow instruction from [Gluu documentation](https://gluu.org/docs/ce/4.0/operation/faq/#revert-an-authentication-method) to restore access.


