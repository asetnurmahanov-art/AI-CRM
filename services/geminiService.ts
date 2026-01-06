const API_URL = '/api';

const handleApiError = (error: any, fallback: string) => {
  console.warn("API Error:", error);
  return `⚠️ ${fallback}`;
};

export const scanProductTag = async (base64Image: string) => {
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

export const getMarketTrends = async () => {
  try {
    const response = await fetch(`${API_URL}/market-trends`);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.text;
  } catch (e) {
    return handleApiError(e, "Тренды временно недоступны.");
  }
};

export const professionalizeImage = async (base64Image: string, productName: string, style: string = 'studio') => {
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

export const generatePostCaption = async (productName: string, brand: string, price: number) => {
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

export const generateSocialReply = async (message: string, customerName: string) => {
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

export const getBusinessInsights = async (inventory: any[], customers: any[]) => {
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
