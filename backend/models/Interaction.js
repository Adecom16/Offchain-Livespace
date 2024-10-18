// models/Interaction.js
const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['message', 'reaction', 'handRaised'], required: true },
  content: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interaction', InteractionSchema);
