require('./config/env'); // Validate env on startup
const createApp = require('./app');
const connectDB = require('./config/db');
const paymentReminderJob = require('./jobs/paymentReminder.job');
const env = require('./config/env');

const allowedOrigins = [
  'http://localhost:5173',
  'https://lms-frontend-psi-nine.vercel.app',
];

const startServer = async () => {
  await connectDB();

  const app = createApp({
    corsOptions: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
  });

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
