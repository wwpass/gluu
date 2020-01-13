# Discourse SSO for Gluu

## Installation and configuration


### Gluu configuration
6. Open `Configuration -> OpenID Connect -> Clients`. Use following parameters:
  - Application type: "Web"
  - Subject Type: "pairwise"
  - Authentication method for the Token Endpoint: "client_secret_post"
  - Grant Types: "authorization_code"
  - Pre-authorization and Persist Client Authorizations can be of any value.
  - Scopes: "openid", "user_name", "ro_nonce"
  - Response Types: "code"
  - Redirect Login URIs: "<helper_webapp_base_url>/anyconnect/"

Generate client secret and save the client to get the ID.
Save the secret and clientID values.

### Helper webapp
1. Deploy `webapp.py` and `templates/` to a directory on a web server.
2. Copy `webapp.conf.example` to the web server and rename it to `webapp.conf`
3. Edit `webapp.conf`, filling values relevan to your system. Don't forget to deploy WWPass Connector application and put a link for downloading it in the config.
4. Configure your web server to run `webapp.py --config=webapp.conf` as a demon.
5. Install python modules for the webapp: "python3-tornado", "python3-jwt"
6. Configure your web server software to proxy requests for relevant virtual host to this helper webapp.



