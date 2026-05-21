const express = require('express');
const router = express.Router();
const GoogleSheetsService = require('../services/GoogleSheetsService');
const SheetConfig = require('../models/SheetConfig');
const auth = require('../middleware/auth');

// Middleware to extract sheet ID and Name from headers
const getSheetContext = (req) => {
    let sheetId = req.headers['x-sheet-id'];
    // Filter out problematic string representations of null/undefined from frontend
    if (!sheetId || sheetId === 'null' || sheetId === 'undefined') {
        sheetId = process.env.GOOGLE_SHEET_ID;
    }
    return {
        spreadsheetId: (sheetId || '').trim(),
        preferredSheetName: req.headers['x-sheet-name'] || null
    };
};

router.get('/', auth, async (req, res) => {
    try {
        const { spreadsheetId } = getSheetContext(req);
        const data = await GoogleSheetsService.getTasks(spreadsheetId);
        res.json(data);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.put('/cell', auth, async (req, res) => {
    const { rowId, colIndex, value } = req.body;
    const { spreadsheetId, preferredSheetName } = getSheetContext(req);
    try {
        const result = await GoogleSheetsService.updateCell(spreadsheetId, rowId, colIndex, value, preferredSheetName);
        
        if (req.io) {
            req.io.emit('sheet_cell_updated', { rowId, colIndex, value });
        }
        
        res.json(result);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.put('/batch-update', auth, async (req, res) => {
    const { updates } = req.body;
    const { spreadsheetId, preferredSheetName } = getSheetContext(req);
    try {
        const result = await GoogleSheetsService.updateCellsBatch(spreadsheetId, updates, preferredSheetName);
        
        if (req.io) {
            updates.forEach(u => {
                req.io.emit('sheet_cell_updated', { rowId: u.rowId, colIndex: u.colIndex, value: u.value });
            });
        }
        
        res.json(result);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.post('/row', auth, async (req, res) => {
    const { values } = req.body;
    const { spreadsheetId, preferredSheetName } = getSheetContext(req);
    try {
        const result = await GoogleSheetsService.addRow(spreadsheetId, values, preferredSheetName);
        res.json(result);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.post('/column', auth, async (req, res) => {
    const { headerName } = req.body;
    const { spreadsheetId, preferredSheetName } = getSheetContext(req);
    try {
        const result = await GoogleSheetsService.addColumn(spreadsheetId, headerName, preferredSheetName);
        res.json(result);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.delete('/row/:rowId', auth, async (req, res) => {
    const { rowId } = req.params;
    const { spreadsheetId, preferredSheetName } = getSheetContext(req);
    try {
        const result = await GoogleSheetsService.deleteRow(spreadsheetId, parseInt(rowId), preferredSheetName);
        res.json(result);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.delete('/column/:colIndex', auth, async (req, res) => {
    const { colIndex } = req.params;
    const { spreadsheetId, preferredSheetName } = getSheetContext(req);
    try {
        const result = await GoogleSheetsService.deleteColumn(spreadsheetId, parseInt(colIndex), preferredSheetName);
        res.json(result);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

// Dropdown configuration
router.get('/config/dropdowns', auth, async (req, res) => {
    try {
        let configs = await SheetConfig.find();
        
        // Pre-populate if empty
        if (configs.length === 0) {
            const defaults = [
                { type: 'status', options: ["Yet to start", "In progress", "Finished", "Delivered", "Waiting for client confirmation", "Selection pending", "Reels", "NA"] },
                { type: 'event', options: ["Wedding", "Engagement", "Pre wedding", "House warming", "Haldi", "Sangeet", "Naming Ceremony", "Baby shower", "Corporate"] },
                { type: 'photos', options: ["Pending", "Updated to drive", "Copied to Hard drive/pendrive"] },
                { type: 'team', options: ["Shashank", "Anil", "YOGESH", "Sachitha", "Outsource", "Mallikarjuna"] }
            ];
            await SheetConfig.insertMany(defaults);
            configs = await SheetConfig.find();
        }
        
        res.json(configs);
    } catch (error) {
        console.error('❌ Google Sheets API Error:', error.message);
        res.status(500).json({ 
            error: error.message, 
            details: error.response?.data || 'Check backend logs for full trace'
        });
    }
});

router.post('/config/dropdowns', auth, async (req, res) => {
    const { type, options } = req.body;
    try {
        const config = await SheetConfig.findOneAndUpdate(
            { type },
            { options },
            { upsert: true, new: true }
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
