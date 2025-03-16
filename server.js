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

// Documentation URLs
const docsUrls = [
  'https://project.pages.drupalcode.org/ui_patterns/',
  'https://project.pages.drupalcode.org/ui_patterns/1-users/0-component-form/',
  'https://project.pages.drupalcode.org/ui_patterns/1-users/1-as-block/',
  'https://project.pages.drupalcode.org/ui_patterns/1-users/2-as-layout/',
  'https://project.pages.drupalcode.org/ui_patterns/1-users/3-in-field-formatter/',
  'https://project.pages.drupalcode.org/ui_patterns/1-users/4-with-views/',
  'https://project.pages.drupalcode.org/ui_patterns/1-users/5-presenter-templates/',
  'https://project.pages.drupalcode.org/ui_patterns/2-authors/0-authoring-a-component/',
  'https://project.pages.drupalcode.org/ui_patterns/2-authors/1-stories-and-library/',
  'https://project.pages.drupalcode.org/ui_patterns/2-authors/2-best-practices/',
  'https://project.pages.drupalcode.org/ui_patterns/2-authors/3-migration-from-UIP1/',
  'https://project.pages.drupalcode.org/ui_patterns/3-devs/1-source-plugins/',
  'https://project.pages.drupalcode.org/ui_patterns/3-devs/2-prop-type-plugins/',
  'https://project.pages.drupalcode.org/ui_patterns/3-devs/3-internals/',
  'https://project.pages.drupalcode.org/ui_patterns/faq/'
];

// Read rules file
const rulesContent = fs.readFileSync('./rules.md', 'utf8');

// Create Claude model
const model = new ChatAnthropic({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-7-sonnet-20250219',
  systemPrompt: rulesContent
});

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
    // Initialize conversation with documentation links
    const messages = [
      {
        role: 'user',
        content: `I'll be asking you questions about UI Patterns in Drupal. Please refer to these documentation sources for accurate information:
${docsUrls.join('\n')}

Please introduce yourself briefly.`
      }
    ];
    
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
    messages: sessions[sessionId].messages.slice(1) // Skip the documentation message
  });
});

// Send a message to Tess
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // Add user message to history
    sessions[sessionId].messages.push({
      role: 'user',
      content: message
    });
    
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