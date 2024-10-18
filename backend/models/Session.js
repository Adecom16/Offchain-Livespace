// models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  isRecording: { type: Boolean, default: false },
  recordingUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Session', SessionSchema);
