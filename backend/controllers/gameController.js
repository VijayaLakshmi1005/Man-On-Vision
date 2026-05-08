const GameImage = require('../models/GameImage');
const GameSetting = require('../models/GameSetting');
const UserGameHistory = require('../models/UserGameHistory');
const Score = require('../models/Score');

exports.getRandomGameData = async (req, res) => {
  try {
    const { gameType, userId, sessionId, all } = req.query;
    console.log(`[GAME] Fetching data for ${gameType} | All: ${all} | Session: ${sessionId}`);

    if (all === 'true') {
      const allContent = await GameImage.find({ gameType, isActive: true }).sort({ createdAt: -1 });
      return res.status(200).json(allContent);
    }

    // Get user history
    let history = null;
    if (userId) {
      history = await UserGameHistory.findOne({ userId });
    } else if (sessionId) {
      history = await UserGameHistory.findOne({ sessionId });
    }

    const playedIds = history ? history.playedContent
      .filter(item => item.gameType === gameType)
      .map(item => item.contentId) : [];

    // Smart Adaptation: Determine difficulty based on history
    let suggestedDifficulty = 'medium';
    if (history && history.playedContent.length > 0) {
      const recentGames = history.playedContent
        .filter(item => item.gameType === gameType)
        .slice(-3);
      
      if (recentGames.length >= 3) {
        const avgAccuracy = recentGames.reduce((acc, g) => acc + (g.accuracy || 100), 0) / recentGames.length;
        if (avgAccuracy > 85) suggestedDifficulty = 'hard';
        else if (avgAccuracy < 50) suggestedDifficulty = 'easy';
      }
    }

    // Fetch new content
    let content = await GameImage.aggregate([
      { $match: { gameType, _id: { $nin: playedIds }, isActive: true, difficulty: suggestedDifficulty } },
      { $sample: { size: 1 } }
    ]);

    // If no content with suggested difficulty, try any difficulty that hasn't been played
    if (content.length === 0) {
      content = await GameImage.aggregate([
        { $match: { gameType, _id: { $nin: playedIds }, isActive: true } },
        { $sample: { size: 1 } }
       ]);
    }

    // If still no content (everything played), reset history for this game and reshuffle
    if (content.length === 0) {
      content = await GameImage.aggregate([
        { $match: { gameType, isActive: true } },
        { $sample: { size: 1 } }
      ]);
    }

    const responseData = content[0] ? { ...content[0], suggestedDifficulty } : null;
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const { userId, guestName, gameType, score, difficulty, accuracy, timeTaken, contentId, sessionId } = req.body;

    const newScore = new Score({
      userId,
      guestName,
      gameType,
      score,
      difficulty,
      timeTaken
    });

    await newScore.save();

    // Update history and Streaks
    const updateQuery = userId ? { userId } : { sessionId };
    let history = await UserGameHistory.findOne(updateQuery);
    
    if (!history) {
      history = new UserGameHistory(updateQuery);
    }

    // Add content to played list
    if (contentId) {
      history.playedContent.push({
        gameType,
        contentId,
        score,
        accuracy: accuracy || 100,
        playedAt: new Date()
      });
    }

    // Update Difficulty History
    history.difficultyHistory.push({ gameType, difficulty });

    // Update Streaks (Simple version: increment if win/good score)
    const isWin = score > 0;
    const streakKey = gameType === 'tictactoe' ? 'tictactoe' : (gameType === '2048' ? 'game2048' : 'spot_difference');
    
    if (isWin) {
      history.streaks[streakKey] = (history.streaks[streakKey] || 0) + 1;
    } else {
      history.streaks[streakKey] = 0;
    }

    history.totalPoints += score;
    history.lastPlayed = new Date();
    history.streaks.lastPlayed = new Date();

    await history.save();

    res.status(201).json({ 
      message: 'Score saved successfully', 
      score: newScore,
      streak: history.streaks[streakKey],
      suggestedDifficulty: history.streaks[streakKey] > 3 ? 'hard' : 'medium'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { gameType } = req.query;
    const leaderboard = await Score.find({ gameType })
      .populate('userId', 'name')
      .sort({ score: -1, timeTaken: 1 })
      .limit(10);

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGameSettings = async (req, res) => {
  try {
    const { gameType } = req.query;
    const settings = await GameSetting.findOne({ gameType });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGameZoneData = async (req, res) => {
  try {
    const pageSettings = await GameSetting.findOne({ gameType: 'page_settings' });
    
    // Default games if none configured in DB
    const defaultGames = [
      {
        id: 'tictactoe',
        title: 'Tic Tac Toe',
        description: 'Classic camera vs lights battle. Beat our advanced AI!',
        icon: '🎮',
        image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=800',
        enabled: true
      },
      {
        id: '2048',
        title: '2048 Event Edition',
        description: 'Merge tiles to create the ultimate event setup.',
        icon: '🔢',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        enabled: true
      },
      {
        id: 'spot_difference',
        title: 'Spot The Difference',
        description: 'Find subtle changes in stunning event photography.',
        icon: '🔍',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        enabled: true
      }
    ];

    const settings = pageSettings?.settings || { games: defaultGames, title: "Game Experience Zone" };
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGameStats = async (req, res) => {
  try {
    const totalImages = await GameImage.countDocuments();
    
    const scoreAgg = await Score.aggregate([
      { $group: { _id: null, avg: { $avg: "$score" } } }
    ]);
    const avgScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avg) : 0;

    const totalPlays = await Score.countDocuments();
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSessions24h = await UserGameHistory.countDocuments({ 
      lastPlayed: { $gte: oneDayAgo } 
    });
    
    const totalSessions = await UserGameHistory.countDocuments();
    
    let engagementLabel = "LOW";
    if (totalSessions > 0) {
      const rate = (activeSessions24h / totalSessions) * 100;
      if (rate > 70) engagementLabel = "OPTIMAL";
      else if (rate > 30) engagementLabel = "HIGH";
      else if (rate > 10) engagementLabel = "MODERATE";
    }

    res.json({
      totalImages,
      avgScore,
      totalPlays,
      engagementRate: engagementLabel
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

