const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const chatController = require('../controllers/chatController');

// Session routes
router.get('/sessions', sessionController.getAllSessions);
router.get('/sessions/:sessionId', sessionController.getSession);
router.post('/sessions/:sessionId/rename', sessionController.renameSession);
router.delete('/sessions/:sessionId', sessionController.removeSession);
router.delete('/sessions', sessionController.clearAllSessions);
router.get('/sessions/:sessionId/export', sessionController.exportSession);
router.post('/sessions/import', sessionController.importSession);

// Chat routes
router.post('/init', chatController.initChat);
router.post('/chat', chatController.sendMessage);
router.post('/mode', chatController.changeMode);

module.exports = router;