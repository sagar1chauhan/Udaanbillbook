require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const { getStaff } = require('./controllers/authController');

async function run() {
  await connectDB();
  const harsh = await User.findOne({ email: 'hp4270077@gmail.com' });
  
  const req = {
    user: harsh
  };
  
  const res = {
    status: function(code) {
      console.log('Status code:', code);
      return this;
    },
    json: function(data) {
      console.log('Data returned:', data);
      return this;
    }
  };
  
  await getStaff(req, res);
  process.exit(0);
}

run();
