const fs = require('fs');
const path = require('path');
const { SESSION_CONFIG } = require('../config');

// Set up sessions directory for file-based storage
const sessionsDir = path.join(__dirname, '../../sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

// Save session to file
function saveSession(sessionId, sessionData) {
  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
}

// Load session from file
function loadSession(sessionId) {
  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
}

// List all sessions
function listSessions() {
  if (!fs.existsSync(sessionsDir)) return [];
  
  const files = fs.readdirSync(sessionsDir);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const sessionId = file.replace('.json', '');
      const sessionData = loadSession(sessionId);
      if (!sessionData) return null;
      
      return {
        id: sessionId,
        title: sessionData.title || 'Untitled Conversation',
        createdAt: sessionData.createdAt,
        messageCount: sessionData.messages.length,
        preview: sessionData.messages.length > 2 ? 
          sessionData.messages[2].content.substring(0, 10) + '...' : 
          'New conversation',
        mode: sessionData.mode || 'basic'
      };
    })
    .filter(session => session !== null);
}

// Delete a session
function deleteSession(sessionId) {
  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

// Clean up old sessions (older than 30 days)
function cleanupOldSessions() {
  const MAX_AGE_DAYS = SESSION_CONFIG.MAX_AGE_DAYS;
  const now = Date.now();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  
  if (!fs.existsSync(sessionsDir)) return;
  
  const files = fs.readdirSync(sessionsDir);
  files.forEach(file => {
    if (!file.endsWith('.json')) return;
    
    const filePath = path.join(sessionsDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = now - stats.mtime.getTime();
    
    if (fileAge > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old session: ${file}`);
    }
  });
}

module.exports = {
  saveSession,
  loadSession,
  listSessions,
  deleteSession,
  cleanupOldSessions,
  sessionsDir
};