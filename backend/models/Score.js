const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestName: {
    type: String,
    required: false
  },
  gameType: {
    type: String,
    required: true,
    enum: ['tictactoe', '2048', 'spot_difference', 'object_match']
  },
  score: {
    type: Number,
    required: true
  },
  difficulty: String,
  timeTaken: Number, // in seconds
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Score', ScoreSchema);
