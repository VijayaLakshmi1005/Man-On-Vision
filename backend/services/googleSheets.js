const { google } = require('googleapis');
require('dotenv').config();

// Create an auth client using the Application Default Credentials
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Fetch rows from a specific range in the Google Sheet.
 * Returns an array of objects mapping the first row (headers) to subsequent rows.
 */
async function getSheetData(range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Assume first row is headers
    const headers = rows[0].map(h => h.trim());
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowObject = {};
      
      // If the row is completely empty, skip it
      if (row.length === 0 || row.every(cell => !cell || cell.trim() === '')) {
        continue;
      }

      headers.forEach((header, index) => {
        rowObject[header] = row[index] !== undefined ? row[index] : null;
      });
      data.push(rowObject);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching data for range ${range}:`, error);
    return [];
  }
}

module.exports = {
  getSheetData
};
