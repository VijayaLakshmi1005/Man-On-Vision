const mongoose = require('mongoose');

const GameImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true }, // Main image or Original image
  secondImageUrl: { type: String }, // For Spot the Difference (Edited image)
  gameType: {
    type: String,
    required: true,
    enum: ['spot_difference']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  objects: [{
    name: { type: String },
    x: { type: Number },
    y: { type: Number },
    radius: { type: Number, default: 30 } // Area of click
  }],
  differences: [{
    x: { type: Number },
    y: { type: Number },
    radius: { type: Number, default: 20 }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameImage', GameImageSchema);
