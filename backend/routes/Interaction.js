// routes/interactionRoutes.js
const express = require('express');
const { addMessage, addReaction, raiseHand, getSessionInteractions } = require('../controller/interactionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a message interaction to the session
router.post('/message', authMiddleware, addMessage);

// Add a reaction during a session
router.post('/reaction', authMiddleware, addReaction);

// Raise hand in a session
router.post('/raise-hand', authMiddleware, raiseHand);

// Get all interactions in a session
router.get('/session/:id', authMiddleware, getSessionInteractions);

module.exports = router;
