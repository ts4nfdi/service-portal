Task:
- add a register user step for login

Details:
- At the moment, there is an iam approach to login via the gatewat.
- Before, sending the code to exchange with user token (after redirecting back to app by the provider), there has to be a new step to register the user in case he/she is not registered yet.
- Regieration:
    - endpoint: POST /auth/register
    - json data in request body:
        '''{
  "username": "string",
  "id_token": "string"
}''' 

 - the username must be entered by the user himself
 - the id_token is the one received from the provider

 - how to know user is not registered yet? /auth/sso/login returns 401



    
