require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI ,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL ,
  FROM_NAME: process.env.FROM_NAME || 'LMS',
  RECEIPTS_DIR: process.env.RECEIPTS_DIR || 'receipts',
  UPLOADS_DIR: process.env.UPLOADS_DIR || 'uploads',
};

const required = ['JWT_SECRET', 'MONGODB_URI'];
required.forEach((key) => {
  if (!env[key]) throw new Error(`Missing required env variable: ${key}`);
});

module.exports = env;
