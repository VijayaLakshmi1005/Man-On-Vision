const mongoose = require('mongoose');
const GameImage = require('../models/GameImage');
const GameSetting = require('../models/GameSetting');

require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing game content to avoid duplicates (optional)
    // await GameImage.deleteMany({});

    const objectMatchData = [
      {
        title: 'Cinematic Studio Scene',
        imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200',
        gameType: 'object_match',
        difficulty: 'medium',
        objects: [
          { name: 'Camera', x: 25.5, y: 40.2, radius: 30 },
          { name: 'Studio Light', x: 85.1, y: 20.5, radius: 35 },
          { name: 'Microphone', x: 60.2, y: 75.8, radius: 25 },
          { name: 'Director Chair', x: 15.4, y: 80.1, radius: 40 }
        ]
      }
    ];

    const spotDiffData = [
      {
        title: 'Grand Wedding Hall',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        secondImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', // Mock same for now
        gameType: 'spot_difference',
        difficulty: 'medium',
        differences: [
          { x: 20, y: 30, radius: 25 },
          { x: 50, y: 60, radius: 25 },
          { x: 80, y: 15, radius: 25 }
        ]
      }
    ];

    await GameImage.insertMany([...objectMatchData, ...spotDiffData]);
    console.log('Successfully seeded game content!');

    // Default settings
    await GameSetting.findOneAndUpdate(
      { gameType: 'tictactoe' },
      { 
        settings: {
          themes: ['dark', 'gold'],
          icons: { user: '🎥', ai: '💡' }
        }
      },
      { upsert: true }
    );

    console.log('Seeding complete. Exiting...');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
