let currentUser = null;

// Initialize the chat
async function initializeChat() {
    try {
        // Get or create user
        const userResponse = await fetch('/api/user');
        currentUser = await userResponse.json();
        
        document.getElementById('username').textContent = currentUser.username;
        
        // Load existing messages
        loadMessages();
        
        // Set up polling for new messages
        setInterval(loadMessages, 2000);
        
        // Enable input
        document.getElementById('messageInput').disabled = false;
        document.getElementById('messageInput').placeholder = 'Type your message here...';
        
    } catch (error) {
        console.error('Error initializing chat:', error);
        document.getElementById('username').textContent = 'Error loading user';
    }
}

// Load messages from server
async function loadMessages() {
    try {
        const response = await fetch('/api/chat');
        const data = await response.json();
        
        displayMessages(data.messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Display messages in the chat
function displayMessages(messages) {
    const container = document.getElementById('messages');
    
    if (messages.length === 0) {
        container.innerHTML = '<div class="welcome-message">Welcome to the chat! Start typing to begin.</div>';
        return;
    }
    
    container.innerHTML = messages.map(message => `
        <div class="message">
            <div class="message-header">
                <span class="username">${escapeHtml(message.username)}</span>
                <span class="timestamp">${formatTime(message.timestamp)}</span>
            </div>
            <div class="message-text">${escapeHtml(message.text)}</div>
        </div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Send a new message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !currentUser) return;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser.user_id,
                username: currentUser.username,
                text: text
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            input.value = '';
            loadMessages(); // Reload messages to show the new one
        } else {
            alert('Error sending message: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message');
    }
}

// Handle Enter key in input field
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeChat);