const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ChatAnthropic } = require('@langchain/anthropic');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create Claude model
function getModel() {
  return new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-3-7-sonnet-20250219',
  });
}

// Store conversation history for each session
const sessions = {};

// Add a new endpoint to list all sessions
app.get('/api/sessions', (req, res) => {
  // Create a simplified list of sessions with metadata
  const sessionList = Object.keys(sessions).map(id => {
    const session = sessions[id];
    return {
      id,
      title: session.title || 'Untitled Conversation',
      createdAt: session.createdAt,
      messageCount: session.messages.length,
      // First few characters of the first user message after intro
      preview: session.messages.length > 3 ? 
        session.messages[3].content.substring(0, 60) + '...' : 
        'New conversation'
    };
  });
  
  // Sort by most recent first
  sessionList.sort((a, b) => b.createdAt - a.createdAt);
  
  res.json(sessionList);
});

// Initialize a new session
app.post('/api/init', async (req, res) => {
  const sessionId = Date.now().toString();
  const createdAt = Date.now();
  
  try {
    // Read rules file
    const rulesContent = fs.readFileSync('./rules.md', 'utf8');
    
    // Initialize conversation with rules and introduction request
    const messages = [
      {
        role: 'system',
        content: rulesContent
      },
      {
        role: 'user',
        content: `Please introduce yourself briefly as Tess, the UI Patterns 2 assistant.`
      }
    ];
    
    // Get model instance
    const model = getModel();
    const response = await model.invoke(messages);
    
    // Store the conversation with metadata
    sessions[sessionId] = {
      title: 'New Conversation',
      createdAt,
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: response.content
        }
      ]
    };
    
    res.json({
      sessionId,
      message: response.content
    });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize session' });
  }
});

// Add endpoint to rename a conversation
app.post('/api/sessions/:sessionId/rename', (req, res) => {
  const { sessionId } = req.params;
  const { title } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  sessions[sessionId].title = title;
  res.json({ success: true });
});

// Add endpoint to get a specific session
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Filter out system messages for the client
  const clientMessages = sessions[sessionId].messages.filter(msg => msg.role !== 'system');
  
  res.json({
    id: sessionId,
    title: sessions[sessionId].title,
    createdAt: sessions[sessionId].createdAt,
    messages: clientMessages
  });
});

// Add endpoint to delete a conversation
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Delete the session
  delete sessions[sessionId];
  
  res.json({ success: true });
});

// Send a message to Tess
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // Check if this is a component generation request
    const isComponentRequest = message.toLowerCase().includes('generate') || 
                              message.toLowerCase().includes('create a component') ||
                              message.toLowerCase().includes('ui pattern') ||
                              message.toLowerCase().includes('jira');
    
    let userMessage = message;
    
    // If it seems like a component request, add a reminder
    if (isComponentRequest) {
      userMessage = `${message}\n\nReminder: Please provide ALL FOUR required files (component.yml, Twig, CSS with Tailwind @apply, and Story). Remember that UI Patterns 2 uses props (not settings) which are defined in component.yml and accessed directly in Twig via {{ prop_name }} (not {{ settings.prop_name }}). If you're unsure about anything, please state that clearly instead of generating incorrect information.`;
    }
    
    // Add user message to history
    sessions[sessionId].messages.push({
      role: 'user',
      content: userMessage
    });
    
    // Get model instance
    const model = getModel();
    
    // Get response using messages array
    const response = await model.invoke(sessions[sessionId].messages);
    
    // Add assistant response to history
    sessions[sessionId].messages.push({
      role: 'assistant',
      content: response.content
    });
    
    res.json({ message: response.content });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});