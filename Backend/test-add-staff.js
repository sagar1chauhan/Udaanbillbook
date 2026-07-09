require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function run() {
  await connectDB();
  
  const harsh = await User.findOne({ email: 'hp4270077@gmail.com' });
  if (!harsh) {
    console.log('Harsh Pandey not found!');
    process.exit(1);
  }
  
  console.log('Harsh Pandey User ID:', harsh._id);
  
  const staff = await User.find({ ownerId: harsh._id });
  console.log('Staff list under Harsh Pandey:', staff);
  
  process.exit(0);
}

run();
