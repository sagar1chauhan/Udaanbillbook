require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function run() {
  await connectDB();
  const res = await User.updateOne(
    { email: 'sagar@gmail.com' },
    {
      $set: {
        permissions: ["dashboard", "billing", "inventory", "parties", "expenses", "accounting"]
      }
    }
  );
  console.log('Update result:', res);
  process.exit(0);
}

run();
