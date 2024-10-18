// routes/sessionRoutes.js
const express = require('express');
const { startSession, endSession, getSessionParticipants, getRecordingUrl } = require('../controller/sessionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Start a new session
router.post('/', authMiddleware, startSession);

// End a session
router.put('/:id', authMiddleware, endSession);

// Get current session participants
router.get('/:id/participants', authMiddleware, getSessionParticipants);

// Get recording URL for a session
router.get('/:id/recording', authMiddleware, getRecordingUrl);

module.exports = router;
