const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Room title is required'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required'],
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  privacy: {
    type: String,
    enum: {
      values: ['public', 'private'],
      message: 'Privacy must be either public or private',
    },
    default: 'public',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a method to deactivate a room
RoomSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Room', RoomSchema);
