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
  
  try {
    const staff = await User.create({
      name: 'Test Staff',
      phone: '1234567890',
      email: 'teststaff@gmail.com',
      role: 'staff',
      password: 'somehashedpassword',
      ownerId: harsh._id,
      permissions: ['dashboard', 'billing']
    });
    console.log('Created successfully:', staff);
  } catch (err) {
    console.error('Error during creation:', err);
  }
  
  process.exit(0);
}

run();
