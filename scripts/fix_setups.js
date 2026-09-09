const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/certificate_saas');
  const template = await mongoose.connection.db.collection('templates').findOne({});
  if (!template) {
    console.log('No template found!');
    process.exit(1);
  }
  console.log('Active template:', template._id, template.name);
  const result = await mongoose.connection.db.collection('certificatesetups').updateMany(
    {},
    { $set: { templateId: template._id } }
  );
  console.log('Updated setups count:', result.modifiedCount);
  
  const setups = await mongoose.connection.db.collection('certificatesetups').find({}).toArray();
  setups.forEach(s => console.log('Setup:', s._id, s.name, 'TemplateId:', s.templateId));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
