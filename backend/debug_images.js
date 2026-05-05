const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const GameImage = require('./models/GameImage');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const images = await GameImage.find({ gameType: 'spot_difference' });
    console.log('Spot Difference Images Count:', images.length);
    images.forEach(img => {
      console.log(`- Title: ${img.title}, Active: ${img.isActive}, Difficulty: ${img.difficulty}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
