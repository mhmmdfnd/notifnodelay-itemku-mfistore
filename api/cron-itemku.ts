// api/cron-itemku.ts - Vercel Serverless Function
export default async function handler(req: any, res: any) {
  const ITEMKU_TOKEN = process.env.ITEMKU_TOKEN;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  const TARGET_WA = process.env.TARGET_WA;

  if (!ITEMKU_TOKEN) {
    return res.status(200).json({
      status: 'STANDBY',
      message: 'ITEMKU_TOKEN belum diset di Vercel Environment Variables. Sistem standby.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Panggil Itemku Tokoku API
    const response = await fetch('https://tokoku.itemku.com/api/v1/orders/seller/history?limit=10', {
      headers: {
        'Authorization': `Bearer ${ITEMKU_TOKEN}`,
        'User-Agent': 'ItemkuInstantNotifier/1.0',
        'Accept': 'application/json',
      },
    });

    const data = await response.json() as any;
    const orders = data.data?.orders || [];
    const urgentOrders = orders.filter((o: any) => o.status === 'PAID' || o.status === 'DISPUTED');

    for (const order of urgentOrders) {
      const isDispute = order.status === 'DISPUTED';
      const msgTitle = isDispute ? '⚠️ KENDALA PESANAN ITEMKU!' : '🛒 PESANAN BARU ITEMKU!';
      const msgBody = `${msgTitle}\nOrder ID: ${order.id || order.order_id}\nProduk: ${order.product_name}\nPembeli: ${order.buyer_name}\nTotal: Rp ${Number(order.total_price || 0).toLocaleString('id-ID')}\nWaktu: ${new Date().toLocaleTimeString('id-ID')} WIB`;

      // Kirim ke Telegram
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: msgBody,
          }),
        });
      }

      // Kirim ke WhatsApp (Fonnte)
      if (FONNTE_TOKEN && TARGET_WA) {
        await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': FONNTE_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: TARGET_WA,
            message: msgBody,
          }),
        });
      }
    }

    return res.status(200).json({
      success: true,
      checkedCount: orders.length,
      urgentCount: urgentOrders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
