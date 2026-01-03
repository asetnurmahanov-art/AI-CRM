const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate Limiter: Prevent brute force and DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests, please try again later.',
    },
});

// Setup security middleware
const setupSecurity = (app) => {
    // Helmet secures the app by setting various HTTP headers
    app.use(helmet());

    // Apply rate limiting to all requests
    app.use(limiter);
};

module.exports = setupSecurity;
