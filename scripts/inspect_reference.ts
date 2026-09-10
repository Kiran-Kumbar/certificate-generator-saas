import fs from "fs";
import { createCanvas, loadImage } from "canvas";

async function inspectReference() {
  const img = await loadImage("refrence/image.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  console.log("Reference image dimensions:", img.width, "x", img.height);

  // Sample colors around student name [ Student Name ]
  // In 1055 x 1491, student name is around y: 500 to 570
  // Let's find pixels with non-white color in the center region
  const data = ctx.getImageData(0, 0, img.width, img.height).data;

  function getPixel(x: number, y: number) {
    const idx = (y * img.width + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
      hex: "#" + [data[idx], data[idx + 1], data[idx + 2]].map((c) => c.toString(16).padStart(2, "0")).join(""),
    };
  }

  // Scan vertical line at center x = 527
  console.log("\nScanning center vertical column for text landmarks:");
  for (let y = 300; y < 1200; y += 10) {
    const p = getPixel(Math.floor(img.width / 2), y);
    if (p.r < 240 || p.g < 240 || p.b < 240) {
      console.log(`y=${y}: r=${p.r} g=${p.g} b=${p.b} (${p.hex})`);
    }
  }

  // Scan for the blue colors in "Softmusk Info Pvt. Ltd" and dates
  // Find darkest blue pixels between y = 600 and 800
  let darkestBlue = { r: 255, g: 255, b: 255, hex: "", y: 0, x: 0 };
  for (let y = 600; y < 800; y += 5) {
    for (let x = 200; x < 855; x += 10) {
      const p = getPixel(x, y);
      // Blue has b > r + 30 and b > g + 20 and r < 100
      if (p.b > p.r + 30 && p.b > p.g + 20 && p.b < 160 && p.r < 80) {
        if (p.b < darkestBlue.b) {
          darkestBlue = { ...p, x, y };
        }
      }
    }
  }
  console.log("\nSampled deep blue text color:", darkestBlue);

  // Sample student name color around y = 520 to 560
  let studentNameColor = { r: 255, g: 255, b: 255, hex: "", x: 0, y: 0 };
  for (let y = 510; y < 570; y += 2) {
    for (let x = 400; x < 650; x += 5) {
      const p = getPixel(x, y);
      if (p.b > p.r + 30 && p.r < 50) {
        studentNameColor = { ...p, x, y };
        break;
      }
    }
    if (studentNameColor.hex) break;
  }
  console.log("Sampled Student Name color:", studentNameColor);
}

inspectReference().catch(console.error);
