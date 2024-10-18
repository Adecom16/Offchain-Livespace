const Room = require('../models/Room');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create a new room
exports.createRoom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, privacy } = req.body;

  try {
    const newRoom = new Room({
      title,
      description,
      privacy,
      host: req.user.userId,
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error.message);
    res.status(500).send('Server error');
  }
};

// Get all rooms (with pagination and filtering by privacy)
exports.getRooms = async (req, res) => {
  const { privacy } = req.query;

  try {
    const query = privacy ? { privacy, isActive: true } : { isActive: true };
    const rooms = await Room.find(query).populate('host', 'name');
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error.message);
    res.status(500).send('Server error');
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('host', 'name')
      .populate('participants', 'name');

    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Error fetching room by ID:', error.message);
    res.status(500).send('Server error');
  }
};

// Update room (only the host can update)
exports.updateRoom = async (req, res) => {
  const { title, description, privacy } = req.body;

  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (room.host.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    room.title = title || room.title;
    room.description = description || room.description;
    room.privacy = privacy || room.privacy;

    await room.save();
    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error.message);
    res.status(500).send('Server error');
  }
};

// Join a room
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (room.participants.includes(req.user.userId)) {
      return res.status(400).json({ msg: 'Already a participant' });
    }

    room.participants.push(req.user.userId);
    await room.save();

    res.json(room);
  } catch (error) {
    console.error('Error joining room:', error.message);
    res.status(500).send('Server error');
  }
};

// Leave a room
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    room.participants = room.participants.filter(participant => participant.toString() !== req.user.userId);
    await room.save();

    res.json(room);
  } catch (error) {
    console.error('Error leaving room:', error.message);
    res.status(500).send('Server error');
  }
};

// Host invites users to a room
exports.inviteUsers = async (req, res) => {
  const { userIds } = req.body; // array of user IDs to invite

  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (room.host.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'You are not authorized to invite users' });
    }

    const users = await User.find({ _id: { $in: userIds } });
    room.invitedUsers = users.map(user => user._id);
    await room.save();

    res.json({ msg: 'Users invited successfully', invitedUsers: room.invitedUsers });
  } catch (error) {
    console.error('Error inviting users:', error.message);
    res.status(500).send('Server error');
  }
};

// Room host can make a user a moderator
exports.addModerator = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (room.host.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'You are not authorized to assign moderators' });
    }

    room.moderators.push(req.params.userId);
    await room.save();

    res.json({ msg: 'User is now a moderator' });
  } catch (error) {
    console.error('Error adding moderator:', error.message);
    res.status(500).send('Server error');
  }
};
