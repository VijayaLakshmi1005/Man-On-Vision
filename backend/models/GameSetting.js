const mongoose = require('mongoose');

const GameSettingSchema = new mongoose.Schema({
  gameType: {
    type: String,
    required: true,
    enum: ['tictactoe', '2048', 'spot_difference', 'page_settings']
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameSetting', GameSettingSchema);

