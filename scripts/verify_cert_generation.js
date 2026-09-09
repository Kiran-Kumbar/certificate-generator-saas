const mongoose = require('mongoose');
const { generateCertificateEngine } = require('../src/services/certificate-engine');
const fs = require('fs');
const path = require('path');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');

  const template = await mongoose.connection.db.collection('templates').findOne({});
  const setup = await mongoose.connection.db.collection('certificatesetups').findOne({});

  console.log('Using template:', template.name, 'width:', template.width, 'height:', template.height);
  console.log('Template elements count:', template.elements.length);

  const testData = {
    student_name: "Rahul Sharma",
    reg_no: "528CS23303",
    college_name: "B T Patil & Sons Polytechnic",
    dept: "CSE Dept",
    domain: "Cloud Computing",
    start_date: "2026-01-01",
    end_date: "2026-06-30",
    program_text: setup.programText
  };

  const result = await generateCertificateEngine({
    backgroundUrl: template.backgroundUrl,
    elements: template.elements,
    data: testData,
    certificateNumber: "TEST-CERT-2026-0001",
    width: template.width,
    height: template.height,
  });

  console.log('Render successful!');
  console.log('Layout elements:');
  result.layout.elements.forEach(el => {
    console.log(`[${el.id}] (${el.fontSize}px): "${el.resolvedContent}"`);
  });

  const outDir = path.join(__dirname, 'test_output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pdfPath = path.join(outDir, 'verified_certificate.pdf');
  const pngPath = path.join(outDir, 'verified_certificate.png');

  fs.writeFileSync(pdfPath, result.pdfBuffer);
  fs.writeFileSync(pngPath, result.pngBuffer);

  console.log('Saved test outputs to:', pdfPath, pngPath);
  process.exit(0);
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
