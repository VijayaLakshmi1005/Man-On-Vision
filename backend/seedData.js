const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

const seedData = {
  Hero: [
    ['title', 'highlightedWord', 'subtitle', 'buttonText', 'buttonLink', 'heroImage'],
    ['MAN ON', 'VISION', 'We craft cinematic experiences for visionary brands.', 'START PROJECT', '#', '/assets/heroMOV.png']
  ],
  Vision: [
    ['title', 'highlightedWord', 'description', 'buttonText', 'artwork'],
    ['CRAFTING', 'VISION', 'We believe in the power of visual storytelling to elevate brands and captivate audiences globally.', 'OUR STORY', '/assets/abstract_vision.png']
  ],
  Projects: [
    ['id', 'title', 'category', 'description', 'image', 'link'],
    ['1', 'THE FALLEN', 'CONCEPT ART', 'A conceptual journey', '/assets/gallery/digital_zen.png', '#'],
    ['2', 'CRIMSON TIDE', 'CINEMATOGRAPHY', 'Red themed visual', '/assets/gallery/last_frame.png', '#'],
    ['3', 'VOID WALKER', '3D RENDER', 'Sci-fi 3D render', '/assets/gallery/legacy.png', '#'],
    ['4', 'NEON SHADOWS', 'DIGITAL PAINTING', 'Cyberpunk neon art', '/assets/gallery/neon_nights.png', '#'],
    ['5', 'ETHEREAL', 'FANTASY SCENE', 'Magical fantasy', '/assets/gallery/visionary.png', '#'],
    ['6', 'OBLIVION', 'ENVIRONMENT', 'Post apocalyptic', '/assets/gallery/digital_zen.png', '#'],
    ['7', 'BLOOD MOON', 'CHARACTER DESIGN', 'Character study', '/assets/gallery/last_frame.png', '#'],
    ['8', 'SOLSTICE', 'ILLUSTRATION', 'Summer illustration', '/assets/gallery/legacy.png', '#'],
    ['9', 'DARK MATTER', 'VFX COMPOSITE', 'Visual effects study', '/assets/gallery/neon_nights.png', '#']
  ],
  Services: [
    ['id', 'title', 'description', 'image'],
    ['1', 'CINEMATOGRAPHY', 'Professional camera work', '/assets/gallery/digital_zen.png'],
    ['2', 'POST-PRODUCTION', 'Editing and coloring', '/assets/gallery/neon_nights.png'],
    ['3', 'CREATIVE DIR.', 'Art direction', '/assets/gallery/visionary.png'],
    ['4', 'CONCEPTUALIZATION', 'Idea generation', '/assets/gallery/legacy.png']
  ],
  Contact: [
    ['title', 'email', 'instagram', 'linkedin', 'youtube'],
    ["LET'S CREATE", 'HELLO@MANONVISION.COM', '#', '#', '#']
  ]
};

async function runSeeder() {
  try {
    console.log(`Connecting to Spreadsheet: ${spreadsheetId}`);
    
    // 1. Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingTitles = spreadsheet.data.sheets.map(s => s.properties.title);
    
    // 2. Create missing sheets
    const missingSheets = Object.keys(seedData).filter(title => !existingTitles.includes(title));
    if (missingSheets.length > 0) {
      console.log(`Creating missing sheets: ${missingSheets.join(', ')}`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: missingSheets.map(title => ({
            addSheet: { properties: { title } }
          }))
        }
      });
    }

    // 3. Populate data into sheets
    for (const [sheetName, rows] of Object.entries(seedData)) {
      console.log(`Updating data for ${sheetName}...`);
      
      // Clear first
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `'${sheetName}'!A:Z`
      });

      // Insert data
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rows
        }
      });
    }

    console.log('✅ All data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

runSeeder();
