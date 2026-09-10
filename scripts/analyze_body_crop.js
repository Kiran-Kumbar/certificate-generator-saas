const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function analyzeText() {
  const img = await loadImage('scripts/test_output/body_crop.png');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  function getLineColors(yStart, yEnd) {
    const data = ctx.getImageData(0, yStart, img.width, yEnd - yStart).data;
    const blues = {};
    const darks = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a > 220) {
        if (b > r + 30 && b > g + 15) {
          const hex = '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
          blues[hex] = (blues[hex] || 0) + 1;
        } else if (r < 60 && g < 60 && b < 60) {
          const hex = '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
          darks[hex] = (darks[hex] || 0) + 1;
        }
      }
    }
    const topBlues = Object.entries(blues).sort((a,b)=>b[1]-a[1]).slice(0, 3);
    const topDarks = Object.entries(darks).sort((a,b)=>b[1]-a[1]).slice(0, 3);
    return { topBlues, topDarks };
  }

  console.log('Line 1 (A student of...):', JSON.stringify(getLineColors(15, 45)));
  console.log('Line 2 (from [from date] to [to date] at):', JSON.stringify(getLineColors(50, 80)));
  console.log('Line 3 (Softmusk Info Pvt. Ltd Belagavi, Karnataka.):', JSON.stringify(getLineColors(85, 115)));
  console.log('Line 4 (Was able to successfully participate...):', JSON.stringify(getLineColors(135, 165)));
  console.log('Line 5 (the project entitled...):', JSON.stringify(getLineColors(170, 200)));
}
analyzeText();
