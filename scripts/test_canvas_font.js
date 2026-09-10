const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

const bold = path.join(process.cwd(), 'public', 'fonts', 'Times-Bold.ttf');
const reg = path.join(process.cwd(), 'public', 'fonts', 'Times-Regular.ttf');

registerFont(bold, { family: 'Times New Roman', weight: 'bold' });
registerFont(reg, { family: 'Times New Roman', weight: 'normal' });

const canvas = createCanvas(400, 100);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#03046e';
ctx.font = 'bold 26px "Times New Roman"';
ctx.fillText('Ruchita Lavar', 20, 50);

fs.writeFileSync('scripts/test_output/font_test.png', canvas.toBuffer('image/png'));
console.log('Success! font_test.png rendered with real Times New Roman font!');
