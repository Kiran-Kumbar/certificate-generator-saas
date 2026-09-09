const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({});
  const setup = await db.collection('certificatesetups').findOne({});

  if (!user || !setup) {
    console.error('User or setup not found in DB');
    process.exit(1);
  }

  const token = jwt.sign(
    { userId: String(user._id), email: user.email, role: 'admin', institutionId: String(user.institutionId) },
    'certificate-saas-super-secret-jwt-key'
  );

  console.log('Sending single certificate generation request with setup:', setup.name);

  const recipientData = {
    student_name: "Rahul Sharma",
    reg_no: "528CS23303",
    college_name: "B T Patil & Sons Polytechnic",
    dept: "CSE Dept",
    domain: "Cloud Computing",
    start_date: "2026-01-01",
    end_date: "2026-06-30"
  };

  const res = await fetch('http://localhost:3000/api/certificates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'token=' + token
    },
    body: JSON.stringify({
      setupId: String(setup._id),
      recipientData
    })
  });

  const data = await res.json();
  console.log('Response Status:', res.status);
  console.log('Response Data:', JSON.stringify(data, null, 2));

  if (!res.ok || !data.certificateId) {
    console.error('Generation failed!');
    process.exit(1);
  }

  // Fetch created cert from DB to inspect
  const cert = await db.collection('certificates').findOne({ _id: new mongoose.Types.ObjectId(data.certificateId) });
  console.log('Created Certificate in DB:');
  console.log('StudentName:', cert.studentName);
  console.log('CertificateNumber:', cert.certificateNumber);
  console.log('RecipientData:', JSON.stringify(cert.recipientData, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error('Error in main:', err);
  process.exit(1);
});
