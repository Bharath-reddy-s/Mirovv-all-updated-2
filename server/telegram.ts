import type { Order } from "@shared/schema";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendOrderToTelegram(order: Order): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
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
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo: productImage,
          caption: message,
          parse_mode: 'Markdown',
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
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
