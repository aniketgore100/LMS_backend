require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://goreaniket100_db_user:hUxdr3tzI4OZrHVJ@lms1.vwnifpm.mongodb.net/';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const USER = {
  name: 'Admin',
  email: 'admin@lms.com',
  password: 'Admin@123',
  role: 'admin',
};

async function createUser() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: USER.email });
  if (existing) {
    console.log(`User already exists: ${USER.email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(USER.password, 12);
  await User.create({ ...USER, password: hashed });

  console.log('✅ User created successfully');
  console.log(`   Email:    ${USER.email}`);
  console.log(`   Password: ${USER.password}`);
  console.log(`   Role:     ${USER.role}`);
  process.exit(0);
}

createUser().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});