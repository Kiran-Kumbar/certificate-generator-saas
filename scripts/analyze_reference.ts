import fs from "fs";
import { createCanvas, loadImage } from "canvas";

async function analyze() {
  const img = await loadImage("refrence/image.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const w = img.width; // 1055
  const h = img.height; // 1491

  console.log("Size:", w, "x", h);

  // Let's locate the left gold diamond: around x: 100-250, y: 500-650
  // and right gold diamond: around x: 800-950, y: 500-650
  const data = ctx.getImageData(0, 0, w, h).data;
  function getPixel(x: number, y: number) {
    const idx = (y * w + x) * 4;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
  }

  // Find gold pixels: r > 180, g > 120, b < 60
  let leftDiamond = { minX: 9999, maxX: 0, minY: 9999, maxY: 0, count: 0 };
  let rightDiamond = { minX: 9999, maxX: 0, minY: 9999, maxY: 0, count: 0 };

  for (let y = 450; y < 650; y++) {
    for (let x = 100; x < 300; x++) {
      const p = getPixel(x, y);
      if (p.r > 160 && p.g > 110 && p.b < 50) {
        leftDiamond.minX = Math.min(leftDiamond.minX, x);
        leftDiamond.maxX = Math.max(leftDiamond.maxX, x);
        leftDiamond.minY = Math.min(leftDiamond.minY, y);
        leftDiamond.maxY = Math.max(leftDiamond.maxY, y);
        leftDiamond.count++;
      }
    }
    for (let x = 750; x < 950; x++) {
      const p = getPixel(x, y);
      if (p.r > 160 && p.g > 110 && p.b < 50) {
        rightDiamond.minX = Math.min(rightDiamond.minX, x);
        rightDiamond.maxX = Math.max(rightDiamond.maxX, x);
        rightDiamond.minY = Math.min(rightDiamond.minY, y);
        rightDiamond.maxY = Math.max(rightDiamond.maxY, y);
        rightDiamond.count++;
      }
    }
  }

  console.log("Left Gold Diamond bounds:", leftDiamond);
  console.log("Right Gold Diamond bounds:", rightDiamond);

  // Student name bounds: y between 480 and 600, x between 250 and 800
  let studentNameBounds = { minX: 9999, maxX: 0, minY: 9999, maxY: 0 };
  for (let y = 480; y < 600; y++) {
    for (let x = 250; x < 800; x++) {
      const p = getPixel(x, y);
      // Navy blue: b > 70, r < 40, g < 40
      if (p.b > 60 && p.r < 40 && p.g < 40) {
        studentNameBounds.minX = Math.min(studentNameBounds.minX, x);
        studentNameBounds.maxX = Math.max(studentNameBounds.maxX, x);
        studentNameBounds.minY = Math.min(studentNameBounds.minY, y);
        studentNameBounds.maxY = Math.max(studentNameBounds.maxY, y);
      }
    }
  }
  console.log("Student Name placeholder bounds:", studentNameBounds);

  // Check lines below student name: y from 600 to 1000
  // Let's find rows with text (dark pixels)
  const textRows: { y: number; minX: number; maxX: number; sampleColor: string }[] = [];
  for (let y = 600; y < 1000; y += 2) {
    let hasDark = false;
    let minX = 9999, maxX = 0;
    let sampleColor = "";
    for (let x = 80; x < 975; x += 4) {
      const p = getPixel(x, y);
      if (p.r < 100 || (p.b > 60 && p.r < 40)) {
        hasDark = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        sampleColor = `#${p.r.toString(16).padStart(2,"0")}${p.g.toString(16).padStart(2,"0")}${p.b.toString(16).padStart(2,"0")}`;
      }
    }
    if (hasDark) {
      textRows.push({ y, minX, maxX, sampleColor });
    }
  }

  // Group contiguous rows into text lines
  const lines: { startY: number; endY: number; minX: number; maxX: number; height: number }[] = [];
  let currentLine: any = null;
  for (const r of textRows) {
    if (!currentLine) {
      currentLine = { startY: r.y, endY: r.y, minX: r.minX, maxX: r.maxX };
    } else if (r.y - currentLine.endY <= 6) {
      currentLine.endY = r.y;
      currentLine.minX = Math.min(currentLine.minX, r.minX);
      currentLine.maxX = Math.max(currentLine.maxX, r.maxX);
    } else {
      currentLine.height = currentLine.endY - currentLine.startY;
      lines.push(currentLine);
      currentLine = { startY: r.y, endY: r.y, minX: r.minX, maxX: r.maxX };
    }
  }
  if (currentLine) {
    currentLine.height = currentLine.endY - currentLine.startY;
    lines.push(currentLine);
  }

  console.log("\nDetected Text Lines below student name (count: " + lines.length + "):");
  lines.forEach((l, i) => {
    console.log(` Line ${i + 1}: y=${l.startY}..${l.endY} (height=${l.height}), x=${l.minX}..${l.maxX} (width=${l.maxX - l.minX})`);
  });
}

analyze().catch(console.error);
