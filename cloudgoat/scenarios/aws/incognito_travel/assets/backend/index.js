const jwt = require('jsonwebtoken');

// Mock Database
const users = [
    { email: 'cory@hacksmarter.hsm', name: 'Cory (Admin)', role: 'admin', trips: ['Moon Safari', 'Deep Sea Exploration'] },
];

exports.handler = async (event) => {
    const path = event.path || event.requestContext?.http?.path;
    const method = event.httpMethod || event.requestContext?.http?.method;

    try {
        if (path === '/login' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { email, password } = body;

            const user = users.find(u => u.email === email.toLowerCase());
            if (!user) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'User does not exist' }),
                };
            }
            
            // In a real scenario, we'd verify password against Cognito here.
            // For the sake of this custom handler, we assume password verification fails if it's not the right password.
            // We'll simulate a failure to show the enumeration.
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Incorrect password' }),
            };
        }

        if (path === '/profile' && method === 'GET') {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            if (!authHeader) {
                return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token); // We use decode for simplicity, real app would verify signature
            
            if (!decoded || !decoded.email) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Token' }) };
            }

            // VULNERABILITY: Normalizing email from token to lowercase
            const normalizedEmail = decoded.email.toLowerCase();
            const userProfile = users.find(u => u.email === normalizedEmail);

            if (userProfile) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ profile: userProfile }),
                };
            } else {
                // If it's a new user (attacker), we return a generic profile
                return {
                    statusCode: 200,
                    body: JSON.stringify({ profile: { email: decoded.email, name: 'New Explorer', role: 'user', trips: [] } }),
                };
            }
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Not Found' }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
