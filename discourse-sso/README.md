# Discourse SSO for Gluu

This is SSO module for authenticating in *Discourse* forum using Gluu OpenID Connect. It works by parsing Discourse SSO request, authenticating user with Gluu via OpenID Connect, making SSO response and redirecting the user back to the Discourse with SSO reply.

For information on Discourse SSO see: https://meta.discourse.org/t/official-single-sign-on-for-discourse-sso/13045

## Installation and configuration

### Discourse configuration

Open `Settings->Login`:
  - Set `sso url` to `https://your.deploy.url/discourse`
  - Set `sso secret` to sufficiently random string (256 bits of entropy should be enough)
  - Check `enable sso`
Open `Settings->Users`:
  - Set `logout redirect`: to `https://your.gluu.url/oxauth/restv1/end_session?post_logout_redirect_uri=https%3A%2F%2Fyour.discourse.url%2F`

### Gluu configuration
1. Open `Configuration -> OpenID Connect -> Clients`. Create a new client. Use following parameters:
  - Application type: "Web"
  - Subject Type: "pairwise"
  - Authentication method for the Token Endpoint: "client_secret_jwt"
  - Grant Types: "authorization_code"
  - Pre-authorization and Persist Client Authorizations can be of any value.
  - Scopes: "openid", "email", "profile"
  - Response Types: "code"
  - Redirect Login URIs: "https://your.deploy.url/discourse"
  - Post Logout Redirect URI: "https://your.discourse.url/"
  - Advanced settings -> Front Channel Logout URI: "https://your.discourse.url/sso/logout"

Generate client secret and save the client to get the ID.
Save the secret and clientID values.

2. Open `Configuration -> OpenID Connect -> Scopes`.
Fine `profile` scope and add "memberOf" claim to it.

3. Open `Users->Manage groups`. Find or create groups for Discourse admins and moderators. Note inums of these groups (it's available in the URLs of the group details page).

### Web server configuration
Configure your web server that is serving you Discourse forum to proxy "/sso/logout" URL to "https://your.deploy.url/logout". For example, in Nginx:
```
  location /sso/logout {
          proxy_pass https://your.deploy.url/logout;
  }
```

### Helper webapp
1. Deploy `webapp.py`, `GluuOIDCClient.py` and `templates/` to a directory on a web server.
2. Copy `webapp.conf.example` to the web server and rename it to `webapp.conf`
3. Edit `webapp.conf`, filling values relevan to your system. Fill in the Discourse secret and Gluu client id, secret and group inums.
4. Configure your web server to run `webapp.py --config=webapp.conf` as a demon.
5. Install python modules for the webapp: "python3-tornado", "python3-jwt"
6. Configure your web server software to proxy requests for relevant virtual host to this helper webapp.
