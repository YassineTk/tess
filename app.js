const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import services and routes
const { cleanupOldSessions } = require('./server/services/sessionService');
const apiRoutes = require('./server/routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Run cleanup at startup and daily
cleanupOldSessions();
setInterval(cleanupOldSessions, 24 * 60 * 60 * 1000);

module.exports = app;