const mongoose = require('mongoose');

async function seedSetups() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');
  const db = mongoose.connection.db;

  const template = await db.collection('templates').findOne({ name: 'Softmusk Internship Certificate (Portrait A4)' });
  const user = await db.collection('users').findOne({});

  if (!template || !user) {
    console.error('Template or user not found');
    process.exit(1);
  }

  // Clear existing setups
  await db.collection('certificatesetups').deleteMany({});

  const setups = [
    {
      institutionId: user.institutionId,
      name: 'Softmusk Internship Program (Official)',
      templateId: template._id,
      programText: 'A student of {{college_name}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at “Softmusk Info Pvt. Ltd Belagavi, Karnataka.”',
      variables: [
        { key: 'student_name', label: 'Student Name', type: 'text', required: true },
        { key: 'reg_no', label: 'Registration Number', type: 'text', required: true },
        { key: 'college_name', label: 'College Name', type: 'text', required: true },
        { key: 'dept', label: 'Department', type: 'text', required: true },
        { key: 'domain', label: 'Domain / Project', type: 'text', required: true },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'end_date', label: 'End Date', type: 'date', required: true }
      ],
      folderRule: '/{{year}}/internship',
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      institutionId: user.institutionId,
      name: 'AI & Full Stack Bootcamp 2026',
      templateId: template._id,
      programText: 'A student of {{college_name}} ({{dept}}) has accomplished the intensive industrial project entitled “{{domain}}” from {{start_date}} to {{end_date}}.',
      variables: [
        { key: 'student_name', label: 'Student Name', type: 'text', required: true },
        { key: 'reg_no', label: 'Registration Number', type: 'text', required: true },
        { key: 'college_name', label: 'College Name', type: 'text', required: true },
        { key: 'dept', label: 'Department', type: 'text', required: true },
        { key: 'domain', label: 'Project Domain', type: 'text', required: true },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'end_date', label: 'End Date', type: 'date', required: true }
      ],
      folderRule: '/{{year}}/bootcamp',
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      institutionId: user.institutionId,
      name: 'Excellence & Merit Certification',
      templateId: template._id,
      programText: 'Awarded for extraordinary project execution and technical leadership in “{{domain}}” during the internship term.',
      variables: [
        { key: 'student_name', label: 'Student Name', type: 'text', required: true },
        { key: 'reg_no', label: 'Registration Number', type: 'text', required: true },
        { key: 'college_name', label: 'College Name', type: 'text', required: true },
        { key: 'dept', label: 'Department', type: 'text', required: true },
        { key: 'domain', label: 'Domain', type: 'text', required: true },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'end_date', label: 'End Date', type: 'date', required: true }
      ],
      folderRule: '/{{year}}/merit',
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('certificatesetups').insertMany(setups);
  console.log(`Successfully seeded ${setups.length} distinct certificate setups!`);
  process.exit(0);
}

seedSetups().catch(err => {
  console.error(err);
  process.exit(1);
});
