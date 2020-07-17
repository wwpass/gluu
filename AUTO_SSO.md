# Automatic SSO for Gluu and WWPass
This feature allows more smooth SSO experience for services that don not support IDP initiated SSO.
Normally for such services a user has to explicitly press "Login" button to initiate SSO, even when said user is already logged in to Gluu.
To allow this service to login such a user automatically a following feature was designed.



## How it works
N.B. It only works if the Gluu and the service share second-level domain, e.g. "iam.exmaple.com" and "forum.example.com".
1. When the user logs into Gluu, "wwpass" Custom script sets a special cookie for it's second-level domain, that indicates the login.
2. When the user then tries to access the service, it's web server detects the cookie and redirects the user to login, while deleting the cookie.
3. As the user is logged in into Gluu, the user is redirected back with login credentials.
4. The user continues to use the service with thier account.

## Setup

Log in as Gluu administrator and go to "Configuration -> Manage Custom scripts".
![Person Authentication](./images/custom_script1.png)

In `Person Authentication` tab, find `wwpass` custom script at the bottom of the page

Add the following `Custom Property` field to that script by clicking on `Add new property` button:

- sso_cookie_tags: space separated list of arbitrary unique of your services e.g. "forum mail support"

Click "Update" to save tour changes.

Go to your service's web server and add the configuration that detects "sso_magic" cookie and if it's set to "auth" redirects the user to that service's login (assuming you already set up this service to ude Gluu SSO) and deletes the cookie. The following snippet works for Nginx web server:
```nginx
if ($cookie_sso_magic_<service_tag> = "auth") {
        set $test  A;
}
if ($request_method = "GET") {
        set $test  "${test}B";
}
if ($test = AB) {
        add_header Set-Cookie "sso_magic_<service_tag>=auth; Expires=Thu 01-Jan-1970 00:00:01 GMT; Path=/; Domain=.warca.org";
        return 302 https://<service_sso_login_url>?return_path=/;
}
```

Save and apply your changes in a way appropriate for that web server.

## TODO
1. Properly handle logout, deleting the cookie