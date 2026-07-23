Task:
- Implement seeamless oauth with an auth provider


Task description:
- currently, the app has user/pass login, this must get removed (do not remove the component, just remove it from ui access by user)
- the auth must get replaced with oauth provider with this flow and properties:
    - first call `GET /sso/authorize?redirect_uri=<your redirect_uri>` to get authentication code 
        - this is the backend call that redirects this app to use the auth provider login page
        - for now the redirect_uri is the same as the app url: NEXTAUTH_URL var in the .env file
    - After the redirection and getting the code from url, run an login animation (takes the entire screen). During this animation:
        - get the code from url
        - call `POST /sso/token` to get the token. 
        - request body: 
        ```
{
  "code": "abcdefg123...",
  "redirect_uri": "<your redirect_uri>"
}
        ```

        
        - the response is a json like this:
            ```
{
  "acces_token": "<your access_token>",
  "id_token": "<your id_token>",
  "scope": "oidc",
  "expires_in": "<timestamp>"
}
            ```

        - After this, call `POST /sso/login` to get the jwt token. 
            - request body:
            ```
{
  "acces_token": "<your access_token>",
  "id_token": "<your id_token>"
}
            ```

        - after this
          - show the user name on the profile button
          - set the user as loggied in in the app
          - remove the code from url
          - disable the login animation
          - do not store the access_token. only jwt is enough for tracking the user logging in

- Acceptance criteria:
ask me to test the check the code before moving the spec file.
