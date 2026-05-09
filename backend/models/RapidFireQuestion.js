const mongoose = require('mongoose');

const RapidFireQuestionSchema = new mongoose.Schema({
  question_en: { type: String, required: true },
  question_kn: { type: String },
  options_en: [{ type: String, required: true }],
  options_kn: [{ type: String }],
  correctAnswerIndex: { type: Number, required: true }, // 0-based index
  category: { type: String, default: 'General' },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  audioUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RapidFireQuestion', RapidFireQuestionSchema);
