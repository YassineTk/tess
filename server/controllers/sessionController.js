const { 
  saveSession, 
  loadSession, 
  listSessions, 
  deleteSession,
  sessionsDir
} = require('../services/sessionService');
const fs = require('fs');
const path = require('path');

// List all sessions
const getAllSessions = (req, res) => {
  // Get all sessions
  const sessionList = listSessions();
  
  // Sort by most recent first
  sessionList.sort((a, b) => b.createdAt - a.createdAt);
  
  res.json(sessionList);
};

// Get a specific session
const getSession = (req, res) => {
  const { sessionId } = req.params;
  
  const session = loadSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    id: sessionId,
    title: session.title,
    createdAt: session.createdAt,
    messages: session.messages,
    mode: session.mode || 'basic' // Include the mode
  });
};

// Rename a session
const renameSession = (req, res) => {
  const { sessionId } = req.params;
  const { title } = req.body;
  
  const session = loadSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.title = title;
  saveSession(sessionId, session);
  
  res.json({ success: true });
};

// Delete a session
const removeSession = (req, res) => {
  const { sessionId } = req.params;
  
  try {
    if (deleteSession(sessionId)) {
      res.json({ message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

// Export a session
const exportSession = (req, res) => {
  const { sessionId } = req.params;
  const session = loadSession(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.setHeader('Content-Disposition', `attachment; filename="tess-conversation-${sessionId}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json(session);
};

// Import a session
const importSession = (req, res) => {
  const sessionData = req.body;
  
  if (!sessionData || !sessionData.messages || !sessionData.createdAt) {
    return res.status(400).json({ error: 'Invalid session data' });
  }
  
  const sessionId = Date.now().toString();
  sessionData.importedAt = Date.now();
  
  saveSession(sessionId, sessionData);
  
  res.json({ 
    message: 'Session imported successfully', 
    sessionId 
  });
};

// Delete all sessions
const clearAllSessions = (req, res) => {
  try {
    if (fs.existsSync(sessionsDir)) {
      const files = fs.readdirSync(sessionsDir);
      
      let deletedCount = 0;
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(sessionsDir, file));
          deletedCount++;
        }
      });
      
      res.json({ message: `Successfully deleted ${deletedCount} sessions` });
    } else {
      res.json({ message: 'No sessions directory found' });
    }
  } catch (error) {
    console.error('Error clearing sessions:', error);
    res.status(500).json({ error: 'Failed to clear sessions' });
  }
};

module.exports = {
  getAllSessions,
  getSession,
  renameSession,
  removeSession,
  exportSession,
  importSession,
  clearAllSessions
};