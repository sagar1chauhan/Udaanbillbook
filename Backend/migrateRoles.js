const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany(
      { role: 'admin', phone: { $ne: '9876543210' } },
      { $set: { role: 'vendor' } }
    );
    console.log(`Successfully migrated ${result.modifiedCount} users from admin to vendor.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrate();
