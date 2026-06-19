const express = require('express');
const router = express.Router();
const HomePageContent = require('../models/HomePageContent');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/content/homepage
// @desc    Get homepage content
// @access  Public
router.get('/homepage', async (req, res) => {
    try {
        let content = await HomePageContent.findOne({ page: 'home' });
        if (!content) {
            content = new HomePageContent({ page: 'home', sections: {} });
            await content.save();
        }
        res.json(content.sections);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching content' });
    }
});

// @route   PUT /api/content/homepage
// @desc    Update homepage content
// @access  Private/Admin
router.put('/homepage', auth, admin, async (req, res) => {
    try {
        let content = await HomePageContent.findOne({ page: 'home' });
        if (!content) {
            content = new HomePageContent({ page: 'home', sections: req.body });
        } else {
            content.sections = req.body;
        }
        await content.save();
        res.json(content.sections);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saving content' });
    }
});

module.exports = router;
