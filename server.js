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

// Create Claude model with role-based system prompt
function getModel() {
  // A concise role-based system prompt following Anthropic's best practices
  const systemPrompt = "You are Tess, an expert UI Patterns 2 developer specializing in Drupal. You have deep knowledge of component architecture, Twig templating, and Tailwind CSS. Your primary goal is to help developers implement UI Patterns 2 components correctly. You understand the critical differences between UI Patterns 1.x and 2.x, especially that UI Patterns 2.x uses props (not settings) which are accessed directly in Twig via {{ prop_name }} (not {{ settings.prop_name }}).";
  
  return new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-3-haiku-20240307',
    systemPrompt: systemPrompt
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
      preview: session.messages.length > 2 ? 
        session.messages[2].content.substring(0, 60) + '...' : 
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
    // Read detailed examples and guidelines
    const rulesContent = fs.readFileSync('./rules.md', 'utf8');
    
    // First user message includes the detailed documentation
    const messages = [
      {
        role: 'user',
        content: `Here is critical documentation about UI Patterns 2 that you must follow:\n\n${rulesContent}\n\nPlease introduce yourself briefly as Tess, the UI Patterns 2 assistant.`
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
  
  res.json({
    id: sessionId,
    title: sessions[sessionId].title,
    createdAt: sessions[sessionId].createdAt,
    messages: sessions[sessionId].messages
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
      userMessage = `${message}\n\n
CRITICAL REMINDER FOR UI PATTERNS 2:
1. Use .component.yml files (not .ui_patterns.yml)
2. Access props directly: {{ prop_name }} (NEVER {{ settings.prop_name }})
3. Story files are YAML, not PHP
4. Follow the example components exactly`;
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