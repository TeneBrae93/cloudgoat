const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, AdminGetUserCommand, AdminUpdateUserAttributesCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({});

// Manual Base64 decoding to avoid external dependencies
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        return jsonPayload ? JSON.parse(jsonPayload) : null;
    } catch (e) {
        return null;
    }
}

// Mock Database with Flag for Cory
const users = [
    {
        email: 'cory@hacksmarter.hsm',
        name: 'Cory (Admin)',
        role: 'admin',
        trips: ['Moon Safari', 'Deep Sea Exploration'],
        flag: 'HSM{C0gnit0_Em4il_N0rmaliz4ti0n_FTW}'
    },
];

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': '*'
};

exports.handler = async (event) => {
    const path = event.path || event.requestContext?.http?.path || event.rawPath;
    const method = event.httpMethod || event.requestContext?.http?.method;

    if (method === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        if (path === '/login' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { email, password } = body;

            try {
                await client.send(new AdminGetUserCommand({
                    UserPoolId: process.env.USER_POOL_ID,
                    Username: email
                }));
            } catch (err) {
                if (err.name === 'UserNotFoundException') {
                    return { statusCode: 404, headers, body: JSON.stringify({ message: 'User does not exist' }) };
                }
            }

            try {
                const authRes = await client.send(new AdminInitiateAuthCommand({
                    UserPoolId: process.env.USER_POOL_ID,
                    ClientId: process.env.CLIENT_ID,
                    AuthFlow: 'ADMIN_NO_SRP_AUTH',
                    AuthParameters: { USERNAME: email, PASSWORD: password }
                }));

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        message: 'Login Successful',
                        tokens: {
                            id_token: authRes.AuthenticationResult.IdToken,
                            access_token: authRes.AuthenticationResult.AccessToken
                        }
                    }),
                };
            } catch (err) {
                return { statusCode: 401, headers, body: JSON.stringify({ message: 'Incorrect password' }) };
            }
        }

        if (path === '/register' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { email, password } = body;

            // ENFORCE ATTAK PATH: Block direct registration of target account variants
            if (email.toLowerCase() === 'cory@hacksmarter.hsm') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Registration Forbidden: This identifier is reserved for internal system use.' }),
                };
            }

            try {
                await client.send(new AdminCreateUserCommand({
                    UserPoolId: process.env.USER_POOL_ID,
                    Username: email,
                    UserAttributes: [
                        { Name: 'email', Value: email },
                        { Name: 'email_verified', Value: 'true' }
                    ],
                    MessageAction: 'SUPPRESS'
                }));

                await client.send(new AdminSetUserPasswordCommand({
                    UserPoolId: process.env.USER_POOL_ID,
                    Username: email,
                    Password: password,
                    Permanent: true
                }));

                return { statusCode: 200, headers, body: JSON.stringify({ message: 'Registration Successful.' }) };
            } catch (err) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: `Failed: ${err.message}` }) };
            }
        }

        if (path === '/profile' && method === 'GET') {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };

            const token = authHeader.split(' ')[1];
            const decoded = parseJwt(token);

            if (!decoded || !decoded.email) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid Token' }) };

            // VULNERABILITY: Normalizing email from token to lowercase for lookup
            const normalizedEmail = decoded.email.toLowerCase();
            const userProfile = users.find(u => u.email === normalizedEmail);

            if (userProfile) {
                return { statusCode: 200, headers, body: JSON.stringify({ profile: userProfile }) };
            } else {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ profile: { email: decoded.email, name: 'Guest Explorer', role: 'user', trips: [] } }),
                };
            }
        }

        if (path === '/update-profile' && method === 'POST') {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };

            const body = JSON.parse(event.body || '{}');
            const { name } = body;
            const token = authHeader.split(' ')[1];
            const decoded = parseJwt(token);

            // In a real app, we'd update Cognito attributes here
            // This is just a mock reflecting "Success"
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Profile updated successfully (Mock)' }),
            };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not Found' }) };
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};
