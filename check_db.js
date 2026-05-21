const mongoose = require('mongoose');
const RapidFireQuestion = require('./backend/models/RapidFireQuestion');
require('dotenv').config({ path: './backend/.env' });

async function checkQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to DB');
    const count = await RapidFireQuestion.countDocuments();
    const questions = await RapidFireQuestion.find();
    console.log(`Total questions: ${count}`);
    console.log('Questions:', JSON.stringify(questions, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkQuestions();
