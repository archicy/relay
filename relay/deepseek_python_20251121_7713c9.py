from http.server import BaseHTTPRequestHandler
import json
import random
import time
from datetime import datetime

# Store messages in memory (will reset on server restart)
messages = []
users = {}

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/chat' or self.path == '/api/chat/':
            self.handle_get_messages()
        elif self.path.startswith('/api/user'):
            self.handle_get_user()
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == '/api/chat' or self.path == '/api/chat/':
            self.handle_post_message()
        else:
            self.send_error(404)

    def handle_get_user(self):
        """Generate or retrieve a user with random ID"""
        user_id = str(random.randint(10000, 99999))
        username = f"User{user_id}"
        
        if user_id not in users:
            users[user_id] = {
                'id': user_id,
                'username': username,
                'created_at': datetime.now().isoformat()
            }

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'user_id': user_id,
            'username': username
        }
        self.wfile.write(json.dumps(response).encode())

    def handle_get_messages(self):
        """Get all messages"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'messages': messages[-50:]  # Return last 50 messages
        }
        self.wfile.write(json.dumps(response).encode())

    def handle_post_message(self):
        """Post a new message"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            message = {
                'id': len(messages) + 1,
                'user_id': data.get('user_id'),
                'username': data.get('username'),
                'text': data.get('text'),
                'timestamp': datetime.now().isoformat()
            }
            
            messages.append(message)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps({'success': True, 'message': message}).encode())
            
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())

def main():
    pass