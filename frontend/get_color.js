const fs = require('fs');

async function getPixelColor() {
  const Jimp = (await import('jimp')).default;
  try {
    const image = await Jimp.read('c:/Users/vikas/OneDrive/Desktop/Man-On-Vision/frontend/public/assets/heroMOV.png');
    const hex = image.getPixelColor(10, 10).toString(16);
    console.log('heroMOV.png top-left pixel color (RGBA):', hex);
    
    const image2 = await Jimp.read('c:/Users/vikas/OneDrive/Desktop/Man-On-Vision/frontend/public/assets/heroMOV2.png');
    const hex2 = image2.getPixelColor(10, 10).toString(16);
    console.log('heroMOV2.png top-left pixel color (RGBA):', hex2);
  } catch (err) {
    console.error(err);
  }
}

getPixelColor();
