const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');
  const user = await mongoose.connection.db.collection('users').findOne({});
  const setup = await mongoose.connection.db.collection('certificatesetups').findOne({});

  const sample5Rows = [
    { 'STUDENT NAME': 'Ruchita Lavar', 'REG.NO': '2GI22CS001', 'COLLEGE NAME': 'KLS GIT', 'DEPT': 'CSE', 'DOMAIN': 'AI Full Stack', 'START DATE': 46167, 'END DATE': 46248 },
    { 'STUDENT NAME': 'Aditya Paranjape', 'REG.NO': '528CS23303', 'COLLEGE NAME': 'Yashwantrao Bhonsale Institute', 'DEPT': 'CSE', 'DOMAIN': 'Web Development', 'START DATE': 46167, 'END DATE': 46248 },
    { 'STUDENT NAME': 'Rahul Patil', 'REG.NO': '2GI22CS045', 'COLLEGE NAME': 'KLS GIT', 'DEPT': 'ISE', 'DOMAIN': 'Cloud Computing', 'START DATE': 46167, 'END DATE': 46248 },
    { 'STUDENT NAME': 'Pooja Kulkarni', 'REG.NO': '2GI22CS078', 'COLLEGE NAME': 'Gogte College', 'DEPT': 'ECE', 'DOMAIN': 'Embedded Systems', 'START DATE': 46167, 'END DATE': 46248 },
    { 'STUDENT NAME': 'Sneha Desai', 'REG.NO': '2GI22CS092', 'COLLEGE NAME': 'KLS GIT', 'DEPT': 'CSE', 'DOMAIN': 'Data Science', 'START DATE': 46167, 'END DATE': 46248 }
  ];

  const token = jwt.sign(
    { userId: String(user._id), email: user.email, role: 'admin', institutionId: String(user.institutionId) },
    'certificate-saas-super-secret-jwt-key'
  );

  // 1. Test Preflight
  const pRes = await fetch('http://localhost:3000/api/preflight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': 'token=' + token },
    body: JSON.stringify({ setupId: String(setup._id), rows: sample5Rows })
  });
  const pData = await pRes.json();
  console.log('PREFLIGHT STATUS:', pRes.status, 'SUMMARY:', pData.summary);

  // 2. Test Batch Init
  const bRes = await fetch('http://localhost:3000/api/batches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': 'token=' + token },
    body: JSON.stringify({ setupId: String(setup._id), name: 'Production Batch Test', total: 5 })
  });
  const bData = await bRes.json();
  const batchId = bData.batch?._id;
  console.log('BATCH ID:', batchId);

  // 3. Generate all 5 certificates
  for (let i = 0; i < sample5Rows.length; i++) {
    const cRes = await fetch('http://localhost:3000/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': 'token=' + token },
      body: JSON.stringify({
        setupId: String(setup._id),
        recipientData: sample5Rows[i],
        batchId,
        rowNumber: i + 1
      })
    });
    const cData = await cRes.json();
    console.log(`Row ${i+1} (${sample5Rows[i]['STUDENT NAME']}): status=${cRes.status} success=${cData.success} certNumber=${cData.certificateNumber}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
