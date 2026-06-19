const { getSheetData } = require('../services/googleSheets');

const resolvers = {
  Query: {
    hero: async () => {
      const data = await getSheetData('Hero!A:F');
      if (data && data.length > 0) {
        return data[0]; // Assuming only one row of Hero data
      }
      return null;
    },
    vision: async () => {
      const data = await getSheetData('Vision!A:E');
      if (data && data.length > 0) {
        return data[0]; // Assuming only one row of Vision data
      }
      return null;
    },
    projects: async () => {
      const data = await getSheetData('Projects!A:F');
      return data;
    },
    services: async () => {
      const data = await getSheetData('Services!A:D');
      return data;
    },
    contact: async () => {
      const data = await getSheetData('Contact!A:E');
      if (data && data.length > 0) {
        return data[0]; // Assuming only one row of Contact data
      }
      return null;
    }
  }
};

module.exports = resolvers;
