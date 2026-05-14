# Incognito_Travel Walkthrough

## Summary

In this scenario, you start with only the URL of a travel website. You need to identify a valid user account, register your own account, and then exploit a misconfigured Cognito User Pool to take over the target user's account. Since you have no starting AWS credentials, you must discover all configuration details through the application's source code and session data.

## Detailed Walkthrough

### 1. Enumeration
Start by visiting the travel website. Explore the login page.
Try logging in with various usernames. You will notice that:
- For most usernames, the error is `User does not exist`.
- For `cory@hacksmarter.hsm`, the error is `Incorrect password`.
This confirms `cory@hacksmarter.hsm` is a valid user.

### 2. Reconnaissance (Finding Cognito IDs)
Inspect the website's source code (Ctrl+U or DevTools). Look for any JavaScript files or embedded scripts.
You should find a `COGNITO_CONFIG` object containing:
- `userPoolId`
- `clientId`

### 3. Registration & Token Retrieval
Create your own account on the website (e.g., `attacker@hacksmarter.hsm`). 
Once registered, log in to the portal. 
Open your browser's DevTools (F12) and go to the **Application** (Chrome) or **Storage** (Firefox) tab. 
Under **Local Storage**, find the entry for your session. You should find an `id_token` or `access_token`. 
Copy the **Access Token**; you will need it to call the AWS Cognito API.

### 4. The Normalization Vulnerability
The application backend normalizes email addresses to lowercase before performing lookups. If Cory's email is `cory@hacksmarter.hsm`, we can try to set our email to something that normalizes to it, like `CORY@hacksmarter.hsm`.

### 5. Exploitation (Account Takeover)
Using your discovered `clientId` and your `access_token`, update your own email attribute to `CORY@hacksmarter.hsm` using the AWS CLI. Note that since you don't have IAM credentials, you use the `--access-token` flag which only requires your Cognito session:

```bash
aws cognito-idp update-user-attributes \
    --access-token <your_access_token> \
    --user-attributes Name=email,Value=CORY@hacksmarter.hsm
```

Because "Email verification is not enforced before attribute change takes effect" (a misconfiguration in the User Pool), your email is updated immediately in Cognito.

### 6. Final Access
Go back to the travel website and refresh your session or log in again. The application will receive your new ID Token, see the email `CORY@hacksmarter.hsm`, lowercase it to `cory@hacksmarter.hsm`, and log you in as Cory!
