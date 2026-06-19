const mongoose = require('mongoose');

const HomePageContentSchema = new mongoose.Schema({
    page: { type: String, required: true, unique: true, default: 'home' },
    sections: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('HomePageContent', HomePageContentSchema);
