from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import json

app = Flask(__name__)
CORS(app)

# Mock Database
users = [
    { "email": "cory@hacksmarter.hsm", "name": "Cory (Admin)", "role": "admin", "trips": ["Moon Safari", "Deep Sea Exploration"] },
]

def parse_jwt(token):
    try:
        # JWT format is header.payload.signature
        payload_b64 = token.split('.')[1]
        # Fix padding
        missing_padding = len(payload_b64) % 4
        if missing_padding:
            payload_b64 += '=' * (4 - missing_padding)
        
        decoded_bytes = base64.urlsafe_b64decode(payload_b64)
        return json.loads(decoded_bytes.decode('utf-8'))
    except Exception as e:
        print(f"JWT Parse Error: {e}")
        return None

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower()
    
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        return jsonify({"message": "User does not exist"}), 404
    
    # Simulate password failure for enumeration
    return jsonify({"message": "Incorrect password"}), 401

@app.route('/profile', methods=['GET'])
def profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    decoded = parse_jwt(token)
    
    if not decoded or 'email' not in decoded:
        return jsonify({"message": "Invalid Token"}), 400
    
    # VULNERABILITY: Normalizing email from token to lowercase
    normalized_email = decoded['email'].lower()
    user_profile = next((u for u in users if u['email'] == normalized_email), None)
    
    if user_profile:
        return jsonify({"profile": user_profile}), 200
    else:
        return jsonify({
            "profile": {
                "email": decoded['email'],
                "name": "New Explorer",
                "role": "user",
                "trips": []
            }
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
