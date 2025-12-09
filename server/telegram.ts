import type { Order } from "@shared/schema";
import { storage } from "./storage";

function getTelegramBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function getTelegramChatId(): string | undefined {
  return process.env.TELEGRAM_CHAT_ID;
}

let lastUpdateId = 0;

export async function sendOrderToTelegram(order: Order): Promise<void> {
  const botToken = getTelegramBotToken();
  const chatId = getTelegramChatId();
  
  if (!botToken || !chatId) {
    console.error("Telegram credentials not configured");
    return;
  }

  try {
    const items = order.items as { productId: number; title: string; price: string; quantity: number; image: string }[];
    
    const itemsList = items
      .map(item => `• ${item.title} x${item.quantity} - ${item.price}`)
      .join('\n');

    const orderTime = new Date(order.createdAt).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const message = `🍽️ *New Order #${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📱 *Mobile:* ${order.mobile}
📍 *Address:* ${order.address}
📷 *Instagram:* @${order.instagram}

📋 *Items:*
${itemsList}

💰 *Total: ${order.total}*

${orderTime}`.trim();

    const productImage = items[0]?.image;

    if (productImage && productImage.startsWith('http')) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: productImage,
          caption: message,
          parse_mode: 'Markdown',
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    }

    console.log(`Order #${order.orderNumber} sent to Telegram successfully`);
  } catch (error) {
    console.error('Failed to send order to Telegram:', error);
    throw error;
  }
}

export async function sendOrderDetailsToTelegram(order: Order, targetChatId: string): Promise<void> {
  const botToken = getTelegramBotToken();
  
  if (!botToken) {
    console.error("Telegram bot token not configured");
    return;
  }

  try {
    const items = order.items as { productId: number; title: string; price: string; quantity: number; image: string }[];
    
    const itemsList = items
      .map(item => `• ${item.title} x${item.quantity} - ${item.price}`)
      .join('\n');

    const orderTime = new Date(order.createdAt).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const message = `📦 *Order Details #${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📱 *Mobile:* ${order.mobile}
📍 *Address:* ${order.address}
📷 *Instagram:* @${order.instagram}

📋 *Items:*
${itemsList}

💰 *Total: ${order.total}*

🕐 *Ordered on:* ${orderTime}`.trim();

    const productImage = items[0]?.image;

    if (productImage && productImage.startsWith('http')) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          photo: productImage,
          caption: message,
          parse_mode: 'Markdown',
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    }

    console.log(`Order #${order.orderNumber} details sent to chat ${targetChatId}`);
  } catch (error) {
    console.error('Failed to send order details to Telegram:', error);
  }
}

async function sendTelegramMessage(targetChatId: string, text: string): Promise<void> {
  const botToken = getTelegramBotToken();
  if (!botToken) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

async function processIncomingMessage(message: any): Promise<void> {
  const text = message.text?.trim();
  const chatId = message.chat.id.toString();

  if (!text) return;

  const orderNumberPattern = /^\d{5}$/;
  if (orderNumberPattern.test(text)) {
    const order = await storage.getOrderByNumber(text);
    
    if (order) {
      await sendOrderDetailsToTelegram(order, chatId);
    } else {
      await sendTelegramMessage(chatId, `❌ Order #${text} not found. Please check the order number and try again.`);
    }
  }
}

export async function startTelegramBot(): Promise<void> {
  // Retry a few times to allow secrets to load
  let botToken = getTelegramBotToken();
  let retries = 5;
  
  console.log(`Initial telegram token check: ${botToken ? 'found' : 'not found'}`);
  
  while (!botToken && retries > 0) {
    console.log(`Waiting for telegram token... retries left: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    botToken = getTelegramBotToken();
    retries--;
  }
  
  if (!botToken) {
    console.log("Telegram bot token not configured - bot disabled");
    return;
  }

  console.log("Starting Telegram bot polling...");

  const pollUpdates = async () => {
    const token = getTelegramBotToken();
    if (!token) return;
    
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
      );
      
      const data = await response.json();
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          
          if (update.message) {
            await processIncomingMessage(update.message);
          }
        }
      }
    } catch (error) {
      console.error('Error polling Telegram updates:', error);
    }

    setTimeout(pollUpdates, 1000);
  };

  pollUpdates();
}
