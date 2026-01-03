const express = require('express');
const apiRoutes = express.Router();
const aiController = require('../controllers/aiController');
const securityRoutes = require('./security.routes');

apiRoutes.use('/security', securityRoutes);

// AI Routes
apiRoutes.post('/scan-tag', aiController.scanTag);
apiRoutes.get('/market-trends', aiController.getMarketTrends);
apiRoutes.post('/professionalize-image', aiController.professionalizeImage);
apiRoutes.post('/generate-caption', aiController.generateCaption);
apiRoutes.post('/social-reply', aiController.socialReply);
apiRoutes.post('/business-insights', aiController.businessInsights);

// Social Routes
const socialRoutes = require('./social.routes');
apiRoutes.use('/social', socialRoutes);

module.exports = apiRoutes;
