
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleAiError = (error: any, fallback: string) => {
  console.warn("Gemini API Error:", error);
  if (error?.status === 429 || error?.message?.includes('429')) {
    return `⚠️ Лимит AI исчерпан. ${fallback}`;
  }
  return `⚠️ Сервис временно недоступен. ${fallback}`;
};

export const scanProductTag = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Scan Error", e);
    return null;
  }
};

export const getMarketTrends = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Какие сейчас тренды в детской моде 2024-2025 в Казахстане и СНГ? Какие цвета и бренды популярны?",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text;
  } catch (e) {
    return handleAiError(e, "Тренды временно недоступны.");
  }
};

export const professionalizeImage = async (base64Image: string, productName: string, style: string = 'studio') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `Transform this source photo into professional ${style} catalog image for "${productName}". Keep colors accurate.` }
        ],
      },
    });
    for (const part of response.candidates?.[0].content.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    console.error("Image Gen Error", e);
    return null;
  }
};

export const generatePostCaption = async (productName: string, brand: string, price: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Напиши продающий пост про "${productName}" бренда "${brand}". Цена: ${price} тенге. Используй эмодзи и тон бренда "Умный Бизнес".`,
    });
    return response.text;
  } catch (e) {
    return handleAiError(e, "Попробуйте написать текст вручную.");
  }
};

export const generateSocialReply = async (message: string, customerName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Клиент ${customerName} написал: "${message}". Напиши вежливый ответ от магазина "Умный Бизнес".`,
    });
    return response.text;
  } catch (e) {
    return handleAiError(e, "Автоответ недоступен.");
  }
};

export const getBusinessInsights = async (inventory: any[], customers: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Данные: Склад ${inventory.length} поз, Клиентов ${customers.length}. Дай 3 совета по продажам.`,
    });
    return response.text;
  } catch (e) {
    return handleAiError(e, "Аналитика в режиме ожидания.");
  }
};
