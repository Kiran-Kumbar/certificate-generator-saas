const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');
  const db = mongoose.connection.db;

  const cert = await db.collection('certificates').findOne({ certificateNumber: 'DEMO-2026-000046' });
  if (!cert) {
    console.error('Cert not found');
    process.exit(1);
  }

  let pdfBuffer;
  if (cert.pdfUrl.startsWith('data:')) {
    const b64 = cert.pdfUrl.split(',')[1];
    pdfBuffer = Buffer.from(b64, 'base64');
  } else {
    const res = await fetch(cert.pdfUrl);
    pdfBuffer = Buffer.from(await res.arrayBuffer());
  }

  let pngBuffer;
  if (cert.pngUrl.startsWith('data:')) {
    const b64 = cert.pngUrl.split(',')[1];
    pngBuffer = Buffer.from(b64, 'base64');
  } else {
    const res = await fetch(cert.pngUrl);
    pngBuffer = Buffer.from(await res.arrayBuffer());
  }

  const outDir = path.join(__dirname, 'test_output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'DEMO-000046.pdf'), pdfBuffer);
  fs.writeFileSync(path.join(outDir, 'DEMO-000046.png'), pngBuffer);

  console.log('Saved PDF and PNG to scripts/test_output/');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
