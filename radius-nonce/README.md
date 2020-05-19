# OpenID connect for Gluu RADIUS

This software allows using OpenID connect to authenticate Cisco ASA in FREERADIUS. The web site authenticates in Gluu using OpenID Connect API and generates nonce. This is fed into Cisco AnyConnect by redirecting to `anyconnect://` URI with received nonce as password. Cisco ASA then authenticates the user in RADIUS where another custom script checks `password` field against saved nonce by makeing request to the same app and authenticates the request if the nonce matches.

## Installation and configuration

It's assumed that Gluu is running and Cisco ASA is configured to use FREERADIUS on the same server.

### Gluu configuration
1. Open `Configuration -> OpenID Connect -> Scopes`. Open scope `profile`. Add `memberOf` claim to that scope and click "Update" to save the changes.

2. Open `Configuration -> OpenID Connect -> Clients`. Use following parameters:
  - Application type: "Web"
  - Subject Type: "pairwise"
  - Authentication method for the Token Endpoint: "client_secret_jwt"
  - Grant Types: "authorization_code"
  - Pre-authorization and Persist Client Authorizations can be of any value.
  - Scopes: "openid", "profile"
  - Response Types: "code"
  - Redirect Login URIs: "<helper_webapp_base_url>/anyconnect/"

Generate client secret and save the client to get the ID.
Save the secret and clientID values.

### Helper webapp
1. Deploy `webapp.py`, `GluuOIDCClient.py`, `static` and `templates/` to a directory on a web server.
2. Copy `webapp.conf.example` to the web server and rename it to `webapp.conf`
3. Edit `webapp.conf`, filling values relevan to your system. Don't forget to deploy WWPass Connector application and put a link for downloading it in the config.
4. Configure your web server to run `webapp.py --config=webapp.conf` as a demon.
5. Install python modules for the webapp: "python3-tornado", "python3-jwt"
6. Configure your web server software to proxy requests for relevant virtual host to this helper webapp.

### FREERADIUS configuration

1. Put `freeradius/radius-check.sh` into `/usr/local/bin` or other approppriate location. Make sure it's owned by root ad has permissions: 0755.
2. Configure a client for FREERADIUS in `/etc/freeradius/3.0/clients.conf` refer to FREERADIUS documentation on how to configre clients.
3. Configure a module that would check a nonce issued by the helper webapp. Copy `freeradius/checknonce` to `/etc/freeradius/3.0/mods-available/` and make a symlink to it from `/etc/freeradius/3.0/mods-enabled/`. If you have changed a listening port for the helper webapp, make sure to change it there as well.
4. Confiure a site. Example site configuration is provided in `freeradius/cisco-wwpass`. If you would like to use existing or custom configuration, replace the "authorize" and "authenticate" sections with the following configutration:
```
authorize {
	filter_username		# check for invalid chars in username
	preprocess
	checknonce		# module to authorize. see notice in according module file ${confdir}/mods-enabled/checknonce
	if ( ok ) {		# module exit code
    # here we send Access-Accept if OK
    update control {
      Auth-Type = Accept
    }
  } else { # here we send Access-Reject if module fails
    reject
  }
}

authenticate {
	# No any authentication needed due to WWPass technology.
	# If you are here (in this radius virtual host) you are authenticated already.
}
```
Note that this setup performs all the work in the "authorize" section. "authenticate" just authenticates all the users that were approved in "authorize".

5. Restart your FREERADIUS and point Cisco ASA to use it for authentication.
