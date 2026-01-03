const { GoogleGenAI, Type } = require("@google/genai");
const configManager = require('./configManager');

const handleAiError = (error, fallback) => {
    console.warn("Gemini API Error:", error);
    if (error?.status === 429 || error?.message?.includes('429')) {
        throw { statusCode: 429, message: `⚠️ Лимит AI исчерпан. ${fallback}` };
    }
    if (error?.message?.includes('API key not found')) {
        throw { statusCode: 401, message: `🔒 Система безопасности: API ключ не найден или хранилище заблокировано.` };
    }
    throw { statusCode: 503, message: `⚠️ Сервис временно недоступен. ${fallback}` };
};

class GeminiService {
    _getClient() {
        const apiKey = configManager.getApiKey('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('API key not found. Please unlock the security vault.');
        }
        return new GoogleGenAI({ apiKey });
    }

    async scanProductTag(image) {
        try {
            console.log('Scanning tag...');
            const ai = this._getClient();
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
            return JSON.parse(text || '{}');
        } catch (e) {
            handleAiError(e, 'Ошибка сканирования');
        }
    }

    async getMarketTrends() {
        try {
            console.log('Fetching trends...');
            const ai = this._getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: "Какие сейчас тренды в детской моде 2024-2025 в Казахстане и СНГ? Какие цвета и бренды популярны?",
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
            const text = typeof response.text === 'function' ? response.text() : response.text;
            return { text };
        } catch (e) {
            handleAiError(e, "Тренды временно недоступны.");
        }
    }

    async professionalizeImage(image, productName, style = 'studio') {
        try {
            console.log('Generating image...');
            // Note: 'gemini-2.5-flash-image' usage implies specific access.
            const ai = this._getClient();
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
                return { image: generatedImage };
            } else {
                return { success: true, warning: "Image generation not supported by this model directly or no image returned." };
            }

        } catch (e) {
            handleAiError(e, 'Ошибка генерации');
        }
    }

    async generateCaption(productName, brand, price) {
        try {
            const ai = this._getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: `Напиши продающий пост про "${productName}" бренда "${brand}". Цена: ${price} тенге. Используй эмодзи и тон бренда "Умный Бизнес".`,
            });
            const text = typeof response.text === 'function' ? response.text() : response.text;
            return { text };
        } catch (e) {
            handleAiError(e, "Попробуйте написать текст вручную.");
        }
    }

    async generateSocialReply(message, customerName) {
        try {
            const ai = this._getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: `Клиент ${customerName} написал: "${message}". Напиши вежливый ответ от магазина "Умный Бизнес".`,
            });
            const text = typeof response.text === 'function' ? response.text() : response.text;
            return { text };
        } catch (e) {
            handleAiError(e, "Автоответ недоступен.");
        }
    }

    async getBusinessInsights(inventoryCount, customerCount) {
        try {
            const ai = this._getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: `Данные: Склад ${inventoryCount} поз, Клиентов ${customerCount}. Дай 3 совета по продажам.`,
            });
            const text = typeof response.text === 'function' ? response.text() : response.text;
            return { text };
        } catch (e) {
            handleAiError(e, "Аналитика в режиме ожидания.");
        }
    }
}

module.exports = new GeminiService();
