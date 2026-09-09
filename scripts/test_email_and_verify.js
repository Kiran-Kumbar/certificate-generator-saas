const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function testFeatures() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({});
  const cert = await db.collection('certificates').find({ status: 'issued' }).sort({ createdAt: -1 }).limit(1).next();

  if (!user || !cert) {
    console.error('User or certificate not found');
    process.exit(1);
  }

  const token = jwt.sign(
    { userId: String(user._id), email: user.email, role: 'admin', institutionId: String(user.institutionId) },
    'certificate-saas-super-secret-jwt-key'
  );

  console.log('Testing with certId:', cert._id, 'VerificationToken:', cert.verificationToken);

  // 1. Test Email Preview
  const emailRes = await fetch(`http://localhost:3000/api/certificates/${cert._id}/email`, {
    headers: { Cookie: 'token=' + token }
  });
  const emailData = await emailRes.json();
  console.log('EMAIL PREVIEW STATUS:', emailRes.status, 'SUBJECT:', emailData.emailPreview?.subject);

  // 2. Test Email Send
  const sendRes = await fetch(`http://localhost:3000/api/certificates/${cert._id}/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: 'token=' + token },
    body: JSON.stringify({ to: 'student.test@example.com' })
  });
  const sendData = await sendRes.json();
  console.log('EMAIL SEND STATUS:', sendRes.status, 'MESSAGE:', sendData.message);

  // 3. Test Public Verification Endpoint
  const verifyRes = await fetch(`http://localhost:3000/api/verification/${cert.verificationToken}`);
  const verifyData = await verifyRes.json();
  console.log('VERIFICATION API STATUS:', verifyRes.status, 'VERIFIED:', verifyData.verified, 'STUDENT:', verifyData.studentName);

  process.exit(0);
}

testFeatures().catch(err => {
  console.error(err);
  process.exit(1);
});
