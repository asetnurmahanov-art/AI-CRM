
const API_URL = '/api';

const handleApiError = (error: any, fallback: string) => {
  console.warn("API Error:", error);
  return `⚠️ ${fallback}`;
};

// MOCK DATA GENERATORS
const getMockProduct = () => ({
  brand: 'MOCK BRAND',
  size: 'M',
  price: 15990,
  category: 'Hoodie',
  name: 'Mock Hoodie Black',
  barcode: '123456789',
  material: 'Cotton',
  washingInstructions: '30C'
});

export const scanProductTag = async (base64Image: string, provider: 'api' | 'local' = 'api') => {
  if (provider === 'local') {
    console.log('Using Local Mock for scanProductTag');
    await new Promise(r => setTimeout(r, 1500)); // Sim delay
    return getMockProduct();
  }

  try {
    const cleanImage = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const response = await fetch(`${API_URL}/scan-tag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: cleanImage })
    });

    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (e) {
    console.error("Scan Error", e);
    return null;
  }
};

export const getMarketTrends = async (provider: 'api' | 'local' = 'api') => {
  if (provider === 'local') {
    await new Promise(r => setTimeout(r, 1000));
    return "📈 [LOCAL SIMULATION] Тренды 2025: Экологичность, пастельные тона и минимализм. Популярны бренды Zara Kids и H&M.";
  }

  try {
    const response = await fetch(`${API_URL}/market-trends`);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.text;
  } catch (e) {
    return handleApiError(e, "Тренды временно недоступны.");
  }
};

export const professionalizeImage = async (base64Image: string, productName: string, style: string = 'studio', provider: 'api' | 'local' = 'api') => {
  if (provider === 'local') {
    await new Promise(r => setTimeout(r, 2000));
    // Return original image as mock "processed"
    return base64Image;
  }

  try {
    const cleanImage = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const response = await fetch(`${API_URL}/professionalize-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: cleanImage, productName, style })
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.image || null;
  } catch (e) {
    console.error("Image Gen Error", e);
    return null;
  }
};

export const generatePostCaption = async (productName: string, brand: string, price: number, provider: 'api' | 'local' = 'api') => {
  if (provider === 'local') {
    await new Promise(r => setTimeout(r, 1000));
    return `🔥 [LOCAL] Супер новинка! ${productName} от ${brand} всего за ${price}₸. Успейте купить! #fashion #sale`;
  }

  try {
    const response = await fetch(`${API_URL}/generate-caption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, brand, price })
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.text;
  } catch (e) {
    return handleApiError(e, "Попробуйте написать текст вручную.");
  }
};

export const generateSocialReply = async (message: string, customerName: string, provider: 'api' | 'local' = 'api') => {
  if (provider === 'local') {
    await new Promise(r => setTimeout(r, 1000));
    return `Здравствуйте, ${customerName}! [LOCAL] Спасибо за ваше сообщение: "${message}". Мы скоро ответим!`;
  }

  try {
    const response = await fetch(`${API_URL}/social-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, customerName })
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.text;
  } catch (e) {
    return handleApiError(e, "Автоответ недоступен.");
  }
};

export const getBusinessInsights = async (inventory: any[], customers: any[], provider: 'api' | 'local' = 'api') => {
  if (provider === 'local') {
    await new Promise(r => setTimeout(r, 1000));
    return "📊 [LOCAL] Совет 1: Увеличьте запасы популярных товаров.\nСовет 2: Запустите рассылку.\nСовет 3: Проверьте цены конкурентов.";
  }

  try {
    const response = await fetch(`${API_URL}/business-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryCount: inventory.length, customerCount: customers.length })
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.text;
  } catch (e) {
    return handleApiError(e, "Аналитика в режиме ожидания.");
  }
};
