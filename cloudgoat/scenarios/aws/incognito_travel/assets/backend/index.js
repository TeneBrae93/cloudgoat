// Manual Base64 decoding to avoid external dependencies like jsonwebtoken
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Mock Database
const users = [
    { email: 'cory@hacksmarter.hsm', name: 'Cory (Admin)', role: 'admin', trips: ['Moon Safari', 'Deep Sea Exploration'] },
];

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': '*'
};

exports.handler = async (event) => {
    // Robust path detection for both HTTP API and REST API
    const path = event.path || event.requestContext?.http?.path || event.rawPath;
    const method = event.httpMethod || event.requestContext?.http?.method;

    // Handle OPTIONS for CORS
    if (method === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        if (path === '/login' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { email } = body;

            // Simple enumeration logic
            const user = users.find(u => u.email === email.toLowerCase());
            if (!user) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ message: 'User does not exist' }),
                };
            }
            
            return {
                statusCode: 401, // Simulate password failure to confirm user exists
                headers,
                body: JSON.stringify({ message: 'Incorrect password' }),
            };
        }

        if (path === '/profile' && method === 'GET') {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            if (!authHeader) {
                return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
            }

            const token = authHeader.split(' ')[1];
            const decoded = parseJwt(token);
            
            if (!decoded || !decoded.email) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid Token' }) };
            }

            // VULNERABILITY: Normalizing email from token to lowercase
            const normalizedEmail = decoded.email.toLowerCase();
            const userProfile = users.find(u => u.email === normalizedEmail);

            if (userProfile) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ profile: userProfile }),
                };
            } else {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ profile: { email: decoded.email, name: 'New Explorer', role: 'user', trips: [] } }),
                };
            }
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Not Found' }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
