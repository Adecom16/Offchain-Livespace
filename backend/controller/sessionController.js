// controllers/sessionController.js
const Session = require('../models/Session');
const Room = require('../models/Room');

// Start a new session (only the room host can start it)
exports.startSession = async (req, res) => {
  const { roomId } = req.body;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (room.host.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized to start session' });
    }

    const newSession = new Session({
      room: roomId,
      host: req.user.userId,
      startedAt: new Date()
    });
    await newSession.save();

    room.isActive = true;
    await room.save();

    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// End a session (only the host can end it)
exports.endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    if (session.host.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized to end session' });
    }

    session.endedAt = new Date();
    await session.save();

    const room = await Room.findById(session.room);
    room.isActive = false;
    await room.save();

    res.json({ msg: 'Session ended', session });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Get current session participants
exports.getSessionParticipants = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('participants', 'name');
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    res.json(session.participants);
  } catch (error) {
    res.status(500).send('Server error');
  }
};


exports.getRecordingUrl = async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ msg: 'Session not found' });
      }
  
      // Check if a recording URL exists
      if (!session.recordingUrl) {
        return res.status(404).json({ msg: 'No recording available for this session' });
      }
  
      // Return the recording URL
      res.json({ recordingUrl: session.recordingUrl });
    } catch (error) {
      res.status(500).send('Server error');
    }
  }