const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const { errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const seatRoutes = require('./routes/seat.routes');
const memberRoutes = require('./routes/member.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const createApp = ({ corsOptions } = {}) => {
  const app = express();
  app.disable('x-powered-by');

  // Security & utility middleware
  app.use(helmet());
  app.use(cors(corsOptions || {}));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', apiLimiter);

  // Serve static receipts
  app.use(`/${env.RECEIPTS_DIR}`, express.static(path.resolve(env.RECEIPTS_DIR)));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/seats', seatRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Health check
  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
