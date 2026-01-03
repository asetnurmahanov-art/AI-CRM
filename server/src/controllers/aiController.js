const geminiService = require('../services/geminiService');

exports.scanTag = async (req, res, next) => {
    try {
        console.log('[Controller] scanTag called');
        const { image } = req.body;
        if (!image) {
            console.error('[Controller] No image provided');
            const error = new Error('Image required');
            error.statusCode = 400;
            throw error;
        }
        console.log(`[Controller] Image received, length: ${image.length} `);
        const result = await geminiService.scanProductTag(image);
        console.log('[Controller] Result received from service:', result ? 'OK' : 'NULL');
        res.json(result);
    } catch (error) {
        console.error('[Controller] Error caught:', error);
        next(error);
    }
};

exports.getMarketTrends = async (req, res, next) => {
    try {
        const result = await geminiService.getMarketTrends();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.professionalizeImage = async (req, res, next) => {
    try {
        const { image, productName, style } = req.body;
        const result = await geminiService.professionalizeImage(image, productName, style);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.generateCaption = async (req, res, next) => {
    try {
        const { productName, brand, price } = req.body;
        const result = await geminiService.generateCaption(productName, brand, price);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.socialReply = async (req, res, next) => {
    try {
        const { message, customerName } = req.body;
        const result = await geminiService.generateSocialReply(message, customerName);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.businessInsights = async (req, res, next) => {
    try {
        const { inventoryCount, customerCount } = req.body;
        const result = await geminiService.getBusinessInsights(inventoryCount, customerCount);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
