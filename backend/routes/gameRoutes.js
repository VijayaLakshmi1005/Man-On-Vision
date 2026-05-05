const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/data', gameController.getRandomGameData);
router.post('/score', gameController.submitScore);
router.get('/leaderboard', gameController.getLeaderboard);
router.get('/zone', gameController.getGameZoneData);
router.get('/settings', gameController.getGameSettings);
router.get('/stats', gameController.getGameStats);


module.exports = router;
