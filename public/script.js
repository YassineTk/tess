let sessionId = null;
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const conversationList = document.getElementById('conversation-list');
const conversationTitle = document.getElementById('conversation-title');
const newChatBtn = document.getElementById('new-chat-btn');

// Configure marked to use highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

// Load conversation list
async function loadConversations() {
  try {
    const response = await fetch('/api/sessions');
    const sessions = await response.json();
    
    // Clear the list
    conversationList.innerHTML = '';
    
    // Add each conversation to the list
    sessions.forEach(session => {
      const item = document.createElement('div');
      item.className = 'conversation-item';
      item.dataset.id = session.id;
      
      if (session.id === sessionId) {
        item.classList.add('active');
      }
      
      item.innerHTML = `
        <div class="conversation-title">${session.title}</div>
        <div class="conversation-preview">${session.preview}</div>
      `;
      
      item.addEventListener('click', () => loadConversation(session.id));
      conversationList.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
}

// Load a specific conversation
async function loadConversation(id) {
  try {
    const response = await fetch(`/api/sessions/${id}`);
    const session = await response.json();
    
    // Update session ID
    sessionId = id;
    
    // Update title
    conversationTitle.value = session.title;
    
    // Clear chat container
    chatContainer.innerHTML = '';
    
    // Add messages
    session.messages.forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      addMessage(msg.content, role);
    });
    
    // Update active conversation in list
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`.conversation-item[data-id="${id}"]`)?.classList.add('active');
    
  } catch (error) {
    console.error('Error loading conversation:', error);
  }
}

// Initialize a new chat
async function initChat() {
  try {
    sendButton.disabled = true;
    sendButton.innerHTML = '<div class="loading"></div>';
    
    const response = await fetch('/api/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    sessionId = data.sessionId;
    
    // Clear chat container
    chatContainer.innerHTML = '';
    
    // Display the initial message
    addMessage(data.message, 'assistant');
    
    // Update title
    conversationTitle.value = 'New Conversation';
    
    // Reload conversation list
    loadConversations();
    
    sendButton.disabled = false;
    sendButton.textContent = 'Send';
  } catch (error) {
    console.error('Error initializing chat:', error);
    sendButton.disabled = false;
    sendButton.textContent = 'Send';
  }
}

// Update conversation title
conversationTitle.addEventListener('blur', async () => {
  if (!sessionId) return;
  
  try {
    await fetch(`/api/sessions/${sessionId}/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: conversationTitle.value })
    });
    
    // Reload conversation list to show updated title
    loadConversations();
  } catch (error) {
    console.error('Error updating title:', error);
  }
});

// Add a message to the chat
function addMessage(content, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  // Convert markdown to HTML
  messageContent.innerHTML = marked.parse(content);
  
  messageDiv.appendChild(messageContent);
  chatContainer.appendChild(messageDiv);
  
  // Apply syntax highlighting to code blocks
  messageDiv.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send a message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || !sessionId) return;
  
  // Add user message to chat
  addMessage(message, 'user');
  
  // Clear input
  userInput.value = '';
  
  // Disable send button
  sendButton.disabled = true;
  sendButton.innerHTML = '<div class="loading"></div>';
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId, message })
    });
    
    const data = await response.json();
    
    // Add assistant message to chat
    addMessage(data.message, 'assistant');
    
    // Enable send button
    sendButton.disabled = false;
    sendButton.textContent = 'Send';
    
    // Reload conversation list to update preview
    loadConversations();
  } catch (error) {
    console.error('Error sending message:', error);
    sendButton.disabled = false;
    sendButton.textContent = 'Send';
  }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// New chat button
newChatBtn.addEventListener('click', initChat);

// Initialize the chat when the page loads
window.addEventListener('load', () => {
  initChat();
  loadConversations();
}); 