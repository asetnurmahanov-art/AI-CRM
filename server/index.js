const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./src/config/env');
const setupSecurity = require('./src/middleware/security');
const errorHandler = require('./src/middleware/errorHandler');
const apiRoutes = require('./src/routes/api.routes');

const app = express();

// Middleware
app.use(morgan('dev')); // Logger
app.use(cors());
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Security (Helmet + Rate Limiter)
setupSecurity(app);

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', env: config.nodeEnv });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 Corporate API Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
