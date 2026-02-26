const fetch = require('node-fetch');

const sendTelegramNotification = async (order, user) => {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.log('⚠️  Telegram not configured, skipping notification');
    return;
  }

  const itemsList = order.items
    .map(item => `  • ${item.productName} x${item.quantity} — ${item.price * item.quantity} ر.س`)
    .join('\n');

  const message = `
🆕 طلب جديد #${order._id.toString().slice(-6).toUpperCase()}

👤 العميل: ${user.name}
📧 الإيميل: ${user.email}
📞 الهاتف: ${order.shippingAddress?.phone || 'غير محدد'}
🏙️ المدينة: ${order.shippingAddress?.city || 'غير محدد'}

📦 المنتجات:
${itemsList}

💰 الإجمالي: ${order.totalAmount} ر.س
📋 الحالة: قيد الانتظار

🕐 التاريخ: ${new Date().toLocaleString('ar-EG')}
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );
    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram error:', data.description);
    } else {
      console.log('✅ Telegram notification sent');
    }
  } catch (err) {
    console.error('❌ Telegram notification failed:', err.message);
  }
};

module.exports = { sendTelegramNotification };
