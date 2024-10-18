// routes/roomRoutes.js
const express = require('express');
const { createRoom, getRooms, getRoomById, updateRoom, joinRoom, leaveRoom, inviteUsers, addModerator } = require('../controller/roomController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Create a new room
router.post('/', authMiddleware, createRoom);

// Get all rooms
router.get('/', getRooms);

// Get room by ID
router.get('/:id', getRoomById);

// Update room
router.put('/:id', authMiddleware, updateRoom);

// Join a room
router.post('/:id/join', authMiddleware, joinRoom);

// Leave a room
router.post('/:id/leave', authMiddleware, leaveRoom);

// Host invites users to a room
router.post('/:id/invite', authMiddleware, inviteUsers);

// Add a moderator
router.put('/:id/moderate/:userId', authMiddleware, addModerator);

module.exports = router;
