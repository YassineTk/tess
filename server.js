const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ChatAnthropic } = require('@langchain/anthropic');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Define mode constants
const MODES = {
  BASIC: 'basic',
  FULL: 'full',
  BACKEND: 'backend'
};

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
    modelName: process.env.ANTHROPIC_MODEL, // replace with the claude model you want to use "example: claude-3-7-sonnet-20250219"
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
        'New conversation',
      mode: session.mode || 'basic'
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
  const mode = req.body.mode || MODES.BASIC; // Get mode from request or use default
  
  try {
    // Determine which rules file to use based on the requested mode
    let rulesFile;
    
    switch (mode) {
      case MODES.FULL:
        rulesFile = 'rules-full.md';
        break;
      case MODES.BACKEND:
        rulesFile = 'rules-backend.md';
        break;
      case MODES.BASIC:
      default:
        rulesFile = 'rules.md';
        break;
    }
    
    // Read the appropriate rules file
    let rulesContent;
    try {
      rulesContent = fs.readFileSync(path.join(__dirname, rulesFile), 'utf8');
    } catch (error) {
      console.error(`Error reading ${rulesFile}:`, error);
      // Fallback to rules.md if the specific file doesn't exist
      rulesContent = fs.readFileSync(path.join(__dirname, 'rules.md'), 'utf8');
    }
    
    // First user message includes the documentation
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
      ],
      mode: mode // Store the selected mode
    };
    
    res.json({
      sessionId,
      message: response.content,
      mode: mode
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
    messages: sessions[sessionId].messages,
    mode: sessions[sessionId].mode || 'basic' // Include the mode
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

// Add a new endpoint for mode selection
app.post('/api/mode', async (req, res) => {
  const { sessionId, mode } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // Determine which rules file to use
    let rulesFile;
    let modeName;
    
    switch (mode) {
      case MODES.FULL:
        rulesFile = 'rules-full.md';
        modeName = 'Full Documentation';
        break;
      case MODES.BACKEND:
        rulesFile = 'rules-backend.md';
        modeName = 'Backend Integration';
        break;
      case MODES.BASIC:
      default:
        rulesFile = 'rules.md';
        modeName = 'UI Pattern Generator';
        break;
    }
    
    // Read the appropriate rules file
    let rulesContent;
    try {
      rulesContent = fs.readFileSync(path.join(__dirname, rulesFile), 'utf8');
    } catch (error) {
      console.error(`Error reading ${rulesFile}:`, error);
      // Fallback to rules.md if the specific file doesn't exist
      rulesContent = fs.readFileSync(path.join(__dirname, 'rules.md'), 'utf8');
    }
    
    // Store the current mode
    sessions[sessionId].mode = mode;
    
    // Create a new user message with the updated rules
    const userMessage = {
      role: 'user',
      content: `Please switch to ${modeName} mode. Here is the updated documentation to follow:\n\n${rulesContent}`
    };
    
    // Add the mode change message to history
    sessions[sessionId].messages.push(userMessage);
    
    // Get model instance
    const model = getModel();
    
    // Get response using the full conversation history
    const response = await model.invoke(sessions[sessionId].messages);
    
    // Add assistant response to history
    sessions[sessionId].messages.push({
      role: 'assistant',
      content: response.content
    });
    
    res.json({ 
      message: response.content,
      mode: mode
    });
  } catch (error) {
    console.error('Error changing mode:', error);
    res.status(500).json({ error: 'Failed to change mode' });
  }
});

// Send a message to Tess
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // Add reminder to every message
    let userMessage = `${message}\n\n
CRITICAL REMINDER FOR UI PATTERNS 2:
1. Use .component.yml files (not .ui_patterns.yml)
2. Access props directly: {{ prop_name }} (NEVER {{ settings.prop_name }})
3. Story files should follow the pattern: component_name.variant_name.story.yml
   - Default story should be: component_name.default.story.yml
   - Additional variants: component_name.variant_name.story.yml
4. Don't use a "variants" property - instead use props with enum values
   - Example: 
     alignment:
       title: "Alignment"
       $ref: "ui-patterns://enum"
       enum:
         - default
         - vertical
       "meta:enum":
         default: "Default"
         vertical: "Vertical"
5. Slots NEVER have type definitions, only props do
   - CORRECT slots example:
     slots:
       image:
         title: Image
         description: "Card image."
   - Only props should have types (integer, string, enum, etc.)
6. In story files, image slots should be formatted like this:
   image:
     theme: image
     uri: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
     alt: Shoes
7. NEVER use static heading tags (h1, h2, etc.) in Twig templates
   - Instead, use a heading_level prop with h2 as default
   - Example in props:
     heading_level:
       title: "Heading Level"
       type: string
       default: "h2"
   - Example in Twig: <h{{ heading_level }}>{{ heading }}</h{{ heading_level }}>
8. Follow the example components exactly`;
    
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