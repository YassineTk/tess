const { saveSession, loadSession } = require('../services/sessionService');
const { getModel, loadRulesContent, getCriticalReminder } = require('../services/aiService');
const { MODES, MODE_NAMES, SESSION_CONFIG } = require('../config');

// Initialize a new chat session
const initChat = async (req, res) => {
  const sessionId = Date.now().toString();
  const createdAt = Date.now();
  const mode = req.body.mode || MODES.BASIC; // Get mode from request or use default
  
  try {
    // Load the rules content for the selected mode
    const rulesContent = loadRulesContent(mode);
    
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
    const sessionData = {
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
    
    // Save to file
    saveSession(sessionId, sessionData);
    
    res.json({
      sessionId,
      message: response.content,
      mode: mode
    });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize session' });
  }
};

// Send a message to the AI
const sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;
  
  const session = loadSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // Add reminder to every message
    let userMessage = `${message}\n\n${getCriticalReminder()}`;
    
    // Add user message to history
    session.messages.push({
      role: 'user',
      content: userMessage
    });
    
    // Limit message history if it gets too long
    const MAX_MESSAGES = SESSION_CONFIG.MAX_MESSAGES;
    if (session.messages.length > MAX_MESSAGES) {
      // Keep the first 2 messages (system prompt and initial response)
      // and the most recent messages
      const initialMessages = session.messages.slice(0, 2);
      const recentMessages = session.messages.slice(-MAX_MESSAGES + 2);
      session.messages = [...initialMessages, ...recentMessages];
    }
    
    // Get model instance
    const model = getModel();
    
    // Get response using messages array
    const response = await model.invoke(session.messages);
    
    // Add assistant response to history
    session.messages.push({
      role: 'assistant',
      content: response.content
    });
    
    // Save updated session
    saveSession(sessionId, session);
    
    res.json({ message: response.content });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

// Change the mode of a session
const changeMode = async (req, res) => {
  const { sessionId, mode } = req.body;
  
  const session = loadSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // Load the rules content for the selected mode
    const rulesContent = loadRulesContent(mode);
    const modeName = MODE_NAMES[mode] || 'UI Pattern Generator';
    
    // Store the current mode
    session.mode = mode;
    
    // Create a new user message with the updated rules
    const userMessage = {
      role: 'user',
      content: `Please switch to ${modeName} mode. Here is the updated documentation to follow:\n\n${rulesContent}`
    };
    
    // Add the mode change message to history
    session.messages.push(userMessage);
    
    // Get model instance
    const model = getModel();
    
    // Get response using the full conversation history
    const response = await model.invoke(session.messages);
    
    // Add assistant response to history
    session.messages.push({
      role: 'assistant',
      content: response.content
    });
    
    // Save updated session
    saveSession(sessionId, session);
    
    res.json({ 
      message: response.content,
      mode: mode
    });
  } catch (error) {
    console.error('Error changing mode:', error);
    res.status(500).json({ error: 'Failed to change mode' });
  }
};

module.exports = {
  initChat,
  sendMessage,
  changeMode
};