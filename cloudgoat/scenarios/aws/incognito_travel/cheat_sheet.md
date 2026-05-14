# Incognito_Travel Walkthrough

## Summary

In this scenario, you are provided with limited AWS credentials and the URL of a travel website. You need to identify a valid user account, register your own account, and then exploit a misconfigured Cognito User Pool to take over the target user's account.

## Detailed Walkthrough

### 1. Enumeration
Start by visiting the travel website. Explore the login page.
Try logging in with various usernames. You will notice that:
- For most usernames, the error is `User does not exist`.
- For `cory@hacksmarter.hsm`, the error is `Incorrect password`.
This confirms `cory@hacksmarter.hsm` is a valid user.

### 2. Registration
Create your own account on the website (e.g., `attacker@hacksmarter.hsm`). Login to your new account to understand the application functionality.

### 3. AWS Recon
Use your provided AWS credentials to enumerate the Cognito resources:
```bash
aws cognito-idp list-user-pools --max-results 10
aws cognito-idp list-user-pool-clients --user-pool-id <user_pool_id>
```
Identify the User Pool ID and Client ID used by the travel website.

### 4. Exploring Attributes
Describe the User Pool to check attribute configurations:
```bash
aws cognito-idp describe-user-pool --user-pool-id <user_pool_id>
```
Look for `SchemaAttributes` and `AutoVerifiedAttributes`. Notice that `email` is a standard attribute and there might be custom attributes.

Critically, check the Client configuration:
```bash
aws cognito-idp describe-user-pool-client --user-pool-id <user_pool_id> --client-id <client_id>
```
Check `WriteAttributes`. If `email` is in the list, it means the client (and thus you, as an authenticated user) can modify your own email attribute.

### 5. The Normalization Vulnerability
The application backend normalizes email addresses to lowercase before performing lookups. If Cory's email is `cory@hacksmarter.hsm`, we can try to set our email to something that normalizes to it, like `CORY@hacksmarter.hsm`.

### 6. Exploitation (Account Takeover)
Update your own email attribute to `CORY@hacksmarter.hsm`:
```bash
aws cognito-idp update-user-attributes \
    --access-token <your_authenticated_access_token> \
    --user-attributes Name=email,Value=CORY@hacksmarter.hsm
```
*(Note: You can get your access token by logging in via the CLI or extracting it from the browser's local storage/session.)*

Because "Email verification is not enforced before attribute change takes effect" (a misconfiguration in the User Pool), your email is updated immediately in Cognito.

### 7. Final Access
Go back to the travel website and refresh your session or log in again. The application will receive your new ID Token, see the email `CORY@hacksmarter.hsm`, lowercase it to `cory@hacksmarter.hsm`, and log you in as Cory!
