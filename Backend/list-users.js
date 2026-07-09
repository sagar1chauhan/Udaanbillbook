require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function test() {
  await connectDB();
  const users = await User.find({});
  console.log('ALL USERS:', JSON.stringify(users, null, 2));
  process.exit(0);
}

test();
