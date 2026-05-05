const mongoose = require('mongoose');

const UserGameHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String, required: false }, // For guests
  playedContent: [{
    gameType: String,
    contentId: mongoose.Schema.Types.ObjectId,
    playedAt: { type: Date, default: Date.now },
    score: Number,
    accuracy: Number // For Spot Difference
  }],
  difficultyHistory: [{
    gameType: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    timestamp: { type: Date, default: Date.now }
  }],
  streaks: {
    tictactoe: { type: Number, default: 0 },
    game2048: { type: Number, default: 0 },
    spot_difference: { type: Number, default: 0 },
    lastPlayed: Date
  },
  totalPoints: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserGameHistory', UserGameHistorySchema);
