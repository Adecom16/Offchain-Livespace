// controllers/interactionController.js
const Interaction = require('../models/Interaction');

// Add a message interaction to the session
exports.addMessage = async (req, res) => {
  const { sessionId, content } = req.body;
  try {
    const newInteraction = new Interaction({
      session: sessionId,
      user: req.user.userId,
      type: 'message',
      content
    });
    await newInteraction.save();
    res.status(201).json(newInteraction);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Add a reaction (like clap, thumbs up) during a session
exports.addReaction = async (req, res) => {
  const { sessionId, content } = req.body;  // content could be emoji or reaction type
  try {
    const newInteraction = new Interaction({
      session: sessionId,
      user: req.user.userId,
      type: 'reaction',
      content
    });
    await newInteraction.save();
    res.status(201).json(newInteraction);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Raise hand in a session (to ask for speaking opportunity)
exports.raiseHand = async (req, res) => {
  const { sessionId } = req.body;
  try {
    const newInteraction = new Interaction({
      session: sessionId,
      user: req.user.userId,
      type: 'handRaised'
    });
    await newInteraction.save();
    res.status(201).json(newInteraction);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Get all interactions in a session
exports.getSessionInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find({ session: req.params.id }).populate('user', 'name');
    res.json(interactions);
  } catch (error) {
    res.status(500).send('Server error');
  }
};
