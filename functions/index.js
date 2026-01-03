const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI, Type } = require("@google/genai");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true })); // Allow all origins for now, or specify
app.use(express.json({ limit: '50mb' }));

// AI Client
// Note: In Cloud Functions, environment variables should ideally be set via `firebase functions:config:set` 
// or secrets, but dotenv works if .env is deployed (though less secure for source control).
// For now, we'll strip process.env usage or ensure .env is compatible.
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Helpers
const handleAiError = (error, fallback) => {
    console.warn("Gemini API Error:", error);
    if (error?.status === 429 || error?.message?.includes('429')) {
        return `⚠️ Лимит AI исчерпан. ${fallback}`;
    }
    return `⚠️ Сервис временно недоступен. ${fallback}`;
};

// Routes

// 1. Scan Product Tag
app.post('/scan-tag', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'Image required' });

        console.log('Scanning tag...');
        // Ensure image is clean base64 if needed, SDK handles it if passed correctly
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: image } },
                    { text: `Ты эксперт CRM "Умный Бизнес". Извлеки данные с бирки. Верни JSON: brand, size, price, category, name, barcode, material, washingInstructions.` }
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        brand: { type: Type.STRING },
                        size: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        category: { type: Type.STRING },
                        name: { type: Type.STRING },
                        barcode: { type: Type.STRING },
                        material: { type: Type.STRING },
                        washingInstructions: { type: Type.STRING },
                    },
                    required: ["brand", "size", "price", "category", "name", "barcode", "material", "washingInstructions"],
                }
            }
        });

        const text = typeof response.text === 'function' ? response.text() : response.text;
        const result = JSON.parse(text || '{}');
        res.json(result);
    } catch (e) {
        console.error("Scan Error", e);
        res.status(500).json({ error: handleAiError(e, 'Ошибка сканирования') });
    }
});

// 2. Market Trends
app.get('/market-trends', async (req, res) => {
    try {
        console.log('Fetching trends...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: "Какие сейчас тренды в детской моде 2024-2025 в Казахстане и СНГ? Какие цвета и бренды популярны?",
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        const text = typeof response.text === 'function' ? response.text() : response.text;
        res.json({ text });
    } catch (e) {
        res.status(500).json({ error: handleAiError(e, "Тренды временно недоступны.") });
    }
});

// 3. Professionalize Image
app.post('/professionalize-image', async (req, res) => {
    try {
        const { image, productName, style = 'studio' } = req.body;
        console.log('Generating image...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: image } },
                    { text: `Transform this source photo into professional ${style} catalog image for "${productName}". Keep colors accurate. Return the image inline.` }
                ],
            },
        });

        let generatedImage = null;
        const candidates = response.candidates || [];
        if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImage = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (generatedImage) {
            res.json({ image: generatedImage });
        } else {
            res.json({ success: true, warning: "Image generation not supported by this model directly or no image returned." });
        }

    } catch (e) {
        console.error("Image Gen Error", e);
        res.status(500).json({ error: handleAiError(e, 'Ошибка генерации') });
    }
});

// 4. Generate Caption
app.post('/generate-caption', async (req, res) => {
    try {
        const { productName, brand, price } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `Напиши продающий пост про "${productName}" бренда "${brand}". Цена: ${price} тенге. Используй эмодзи и тон бренда "Умный Бизнес".`,
        });
        const text = typeof response.text === 'function' ? response.text() : response.text;
        res.json({ text });
    } catch (e) {
        res.status(500).json({ error: handleAiError(e, "Попробуйте написать текст вручную.") });
    }
});

// 5. Social Reply
app.post('/social-reply', async (req, res) => {
    try {
        const { message, customerName } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `Клиент ${customerName} написал: "${message}". Напиши вежливый ответ от магазина "Умный Бизнес".`,
        });
        const text = typeof response.text === 'function' ? response.text() : response.text;
        res.json({ text });
    } catch (e) {
        res.status(500).json({ error: handleAiError(e, "Автоответ недоступен.") });
    }
});

// 6. Business Insights
app.post('/business-insights', async (req, res) => {
    try {
        const { inventoryCount, customerCount } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `Данные: Склад ${inventoryCount} поз, Клиентов ${customerCount}. Дай 3 совета по продажам.`,
        });
        const text = typeof response.text === 'function' ? response.text() : response.text;
        res.json({ text });
    } catch (e) {
        res.status(500).json({ error: handleAiError(e, "Аналитика в режиме ожидания.") });
    }
});

// Export as Cloud Function
exports.api = functions.https.onRequest(app);
