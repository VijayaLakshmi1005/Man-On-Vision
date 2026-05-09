const express = require('express');
const router = express.Router();
const adminGameController = require('../controllers/adminGameController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for game asset uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/games';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `game-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/images', adminGameController.getGameImages);
router.post('/images', adminGameController.createGameImage);
router.put('/images/:id', adminGameController.updateGameImage);
router.delete('/images/:id', adminGameController.deleteGameImage);
router.post('/settings', adminGameController.updateGameSettings);
router.post('/upload', upload.single('file'), adminGameController.uploadAsset);

// Kannada Rapid Fire
router.get('/questions', adminGameController.getQuestions);
router.post('/questions', adminGameController.createQuestion);
router.put('/questions/:id', adminGameController.updateQuestion);
router.delete('/questions/:id', adminGameController.deleteQuestion);

module.exports = router;
