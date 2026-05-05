const GameImage = require('../models/GameImage');
const GameSetting = require('../models/GameSetting');

exports.createGameImage = async (req, res) => {
  try {
    const gameImage = new GameImage(req.body);
    await gameImage.save();
    res.status(201).json(gameImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGameImage = async (req, res) => {
  try {
    const { id } = req.params;
    const gameImage = await GameImage.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(gameImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGameImage = async (req, res) => {
  try {
    const { id } = req.params;
    await GameImage.findByIdAndDelete(id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGameImages = async (req, res) => {
  try {
    const { gameType } = req.query;
    const images = await GameImage.find({ gameType }).sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGameSettings = async (req, res) => {
  try {
    const { gameType, settings } = req.body;
    const updated = await GameSetting.findOneAndUpdate(
      { gameType },
      { settings, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadAsset = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Construct the public URL
    const url = `${req.protocol}://${req.get('host')}/uploads/games/${req.file.filename}`;
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
