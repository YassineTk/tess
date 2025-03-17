let sessionId = null;
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const conversationList = document.getElementById('conversation-list');
const conversationTitle = document.getElementById('conversation-title');
const newChatBtn = document.getElementById('new-chat-btn');
const modeSelectionModal = document.getElementById('mode-selection-modal');
const mainContainer = document.getElementById('main-container');
const modeOptions = document.querySelectorAll('.mode-option');
let currentMode = 'basic'; // Default mode

// Mode selection
modeOptions.forEach(option => {
  option.addEventListener('click', function() {
    const selectedMode = this.dataset.mode;
    currentMode = selectedMode;
  
    
    // Hide the mode selection modal
    modeSelectionModal.style.display = 'none';
    
    // Show the main container
    mainContainer.classList.remove('hidden');
    
    // Initialize chat with the selected mode
    initChat(selectedMode);
  });
});


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
// Update the loadConversations function to include delete buttons
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
        <div class="conversation-content">
          <div class="conversation-title">${session.title}</div>
          <div class="conversation-preview">${session.preview}</div>
        </div>
        <button class="delete-btn" title="Delete conversation">×</button>
      `;
      
      // Add click handler for the conversation item
      item.querySelector('.conversation-content').addEventListener('click', () => loadConversation(session.id));
      
      // Add click handler for the delete button
      item.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the conversation load
        deleteConversation(session.id);
      });
      
      conversationList.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
}

// Add a function to handle conversation deletion
async function deleteConversation(id) {
  // Ask for confirmation
  if (!confirm('Are you sure you want to delete this conversation?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // If the deleted conversation was the active one, reset the UI
      if (id === sessionId) {
        // Clear chat container
        chatContainer.innerHTML = '';
        
        // Reset session ID
        sessionId = null;
        
        // Show the mode selection modal
        modeSelectionModal.style.display = 'flex';
        mainContainer.classList.add('hidden');
      }
      
      // Reload the conversation list
      loadConversations();
    } else {
      console.error('Failed to delete conversation');
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
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
    
    // Update mode if available
    if (session.mode) {
      currentMode = session.mode;
    }
    
    // Clear chat container
    chatContainer.innerHTML = '';
    
    // Add messages
    session.messages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        addMessage(msg.content, msg.role);
      }
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
async function initChat(mode = currentMode) {
  try {
    sendButton.disabled = true;
    sendButton.innerHTML = '<div class="loading"></div>';
    
    const response = await fetch('/api/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mode: mode })
    });
    
    const data = await response.json();
    sessionId = data.sessionId;
    currentMode = data.mode || 'basic';
    
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
newChatBtn.addEventListener('click', () => {
  // Show the mode selection modal
  modeSelectionModal.style.display = 'flex';
  mainContainer.classList.add('hidden');
});

// Initialize the chat when the page loads
window.addEventListener('load', () => {
  // Don't auto-initialize, wait for mode selection
  loadConversations();
});

// Add this after the other event listeners (around line 295)
document.getElementById('close-modal-btn')?.addEventListener('click', () => {
  // If there's an active session, just hide the modal
  if (sessionId) {
    modeSelectionModal.style.display = 'none';
    mainContainer.classList.remove('hidden');
  } else {
    // If no active session, initialize with default mode
    modeSelectionModal.style.display = 'none';
    mainContainer.classList.remove('hidden');
    initChat('basic');
  }
});
