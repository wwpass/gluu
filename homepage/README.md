# WWPass+Gluu SSO homepage

This is a web application that provides a homepage with links to other services, available with Gluu SSO. For each installation these services will be different, so the page is configurable as to what is shown to the user. The page is only visible to signed in users. All unknown users are redirected to Gluu signin.

## Installation and configuration

It's assumed that Gluu is running and some services using Gluu SSO are configured.

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

### Webapp installation
1. Deploy `webapp.py`, `GluuOIDCClient.py`, `static/` and `templates/` to a directory on a web server.
2. Copy `webapp.conf.example` to the web server and rename it to `webapp.conf`
3. Edit `webapp.conf`, filling values relevant to your system.
4. Configure your web server to run `python3 webapp.py --config=webapp.conf` as a demon.
5. Install python module for the webapp: "python3-tornado"
6. Configure your web server software to proxy requests for relevant virtual host to this webapp.

### Configuring services
Service links that are displayed to the user are configured in `webapp.conf` in "services" setting.
This ahould be a list of dictionaries. For each service items there are three mandatory fields:
 - url: An URL to rediect user to. Ideally it should immediately authenticate the user with Gluu SSO. I.e. the url should be an SSO login link fo that service.
 - title: Service name that would be displayed to the user
 - logo: URL of service logo, displayed to the user. You can link logo from the service itself or place a logo in a directory of "static_path" listed in the `webapp.conf`.
There is another optional item for a service:
 - groups: This is a list of DN's of Gluu groups. If this is present, the service title will only be shown to users that are members of ANY of hese groups.
N.B. This only controls service visibility on a homepage. For actual access control configure the service itself.