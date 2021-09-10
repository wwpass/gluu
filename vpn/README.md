# OpenID connect for Gluu RADIUS

This software allows using OpenID connect to authenticate Cisco ASA or OpenVPN in FREERADIUS. The web site authenticates in Gluu using OpenID Connect API and generates nonce. This is fed into Cisco AnyConnect by redirecting to `anyconnect://` or ``wwpovpn://` URI with received nonce as password. VPN server then authenticates the user in RADIUS where another custom script checks `password` field against saved nonce by makeing request to the same app and authenticates the request if the nonce matches.

## Installation and configuration

It's assumed that Gluu is running and Cisco ASA and/or OpenVPN server is configured to use FREERADIUS on the server with Gluu.

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
3. Edit `webapp.conf`, filling values relevant for your system.
4. Put downloadable installers into your "download_path" form `webapp.conf`. Your "wwpass_connector_link" and "anyconnect_link" should be "/downloads/<filename_relative_to_download_path>". By default just make `downloads` directory in the same directory with `webapp.py` and put the installers there and fill their names in "*_link". You may use alternative links if you have other place the users can download them from.
5. Configure your web server to run `webapp.py --config=webapp.conf` as a demon.
6. Install python modules for the webapp: "python3-tornado", "python3-jwt"
7. Configure your web server software to proxy requests for relevant virtual host to this helper webapp.

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


### OpenVPN Configuration

On your OpenVPN server install opnevpn-radiusplugin.
In your server config add the lines:
```
plugin /path/to/plugin/radiusplugin.so /etc/openvpn/radiusplugin.cnf
client-cert-not-required # Use both these lines for compatibility with the plugin
verify-client-cert none # If you want not to use clien certificates in addition to WWPass authentication
username-as-common-name
```
Edit example `/etc/openvpn/radiusplugin.cnf` file to set the details for FREERADIUS server. Edit the `NAS-Identifier` parameter to match with the `vpngroup` parameter of OpenVPN profile in `webapp.conf`.

Distribute the client configuration to your clients. You may omit `auth-user-pass` form it. It will be added automatically.
Clients have to import it into OpenVPN GUI. The name of client configuration should match the `config_name` value in `webapp.conf`.

### Cisco ASA configuration

Proper configuration of Cisco ASA is beyond scope of this readme. But it's important no note:

 - As all WWPass users will be connecting with the same username, you have to permit more that 3 default simultaneous sessions. In "Group Policy" modify "simultaneous logins" to over an expected number of simultaneous connections for all WWPass users. Or add `vpn-simultaneous-logins <number of concurrent sessions` to your `group-policy` in command line.