require('./config/env'); // Validate env on startup
const app = require('./app');
const connectDB = require('./config/db');
const paymentReminderJob = require('./jobs/paymentReminder.job');
const env = require('./config/env');

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Start cron jobs
  paymentReminderJob();
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
