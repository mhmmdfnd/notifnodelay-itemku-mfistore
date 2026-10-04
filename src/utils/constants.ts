import { TokokuOrder, BuyerChat, OrderDispute, SellerConfig } from '../types';

export const INITIAL_ORDERS: TokokuOrder[] = [];

export const INITIAL_CHATS: BuyerChat[] = [];

export const INITIAL_DISPUTES: OrderDispute[] = [];

export const DEFAULT_CONFIG: SellerConfig = {
  itemku: {
    apiKey: 'Rsjdk-Pdadav8yT7536M',
    secretKey: 'qtnMdskYIOPVsa9120LLAPfsasd1235dg7Jis9N',
    shopName: 'vercelpro',
    webhookUrl: 'https://vercelpro.app/api/webhook',
    dnsVerified: true,
    pollIntervalSeconds: 1,
    isActive: true,
  },
  telegram: {
    enabled: true,
    botToken: '',
    chatId: '',
    soundAlert: true,
    templateOrder: `🛒 <b>[PESANAN BARU TOKOKU ITEMKU]</b> ⚡
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>{order_number}</code>
🎮 <b>Game:</b> {game_name}
📦 <b>Item:</b> {product_name}
👤 <b>Pembeli:</b> {buyer_name}
💰 <b>Harga:</b> {price}
💵 <b>Net Income:</b> {order_income}
📋 <b>Req Info:</b> {required_info}
⏰ <b>Waktu:</b> {time}
━━━━━━━━━━━━━━━━━━━━
<i>Segera klik Kirim (DELIVER) di dashboard Tokoku API!</i>`,
    templateChat: `💬 <b>[CHAT PEMBELI ITEMKU]</b> 🔔
━━━━━━━━━━━━━━━━━━━━
👤 <b>Dari:</b> {buyer_name}
🎮 <b>Produk:</b> {product_name}
📩 <b>Pesan:</b>
<i>"{message}"</i>
⏰ <b>Waktu:</b> {time}
━━━━━━━━━━━━━━━━━━━━`,
    templateDispute: `🚨 <b>[KENDALA PESANAN ITEMKU]</b> ⚠️
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order:</b> <code>{order_number}</code>
👤 <b>Pembeli:</b> {buyer_name}
📦 <b>Produk:</b> {product_name}
⚠️ <b>Masalah:</b> <code>{reason}</code>
🔴 <b>STATUS: DANA ESCROW DITAHAN</b>
━━━━━━━━━━━━━━━━━━━━`,
  },
  whatsapp: {
    enabled: true,
    provider: 'fonnte',
    token: '',
    targetPhone: '',
    templateOrder: `*🛒 [PESANAN BARU TOKOKU ITEMKU] ⚡*
━━━━━━━━━━━━━━━━━━━━
*Order ID:* {order_number}
*Game:* {game_name}
*Produk:* {product_name}
*Pembeli:* {buyer_name}
*Harga:* {price}
*Income:* {order_income}
*Data Info:* {required_info}
━━━━━━━━━━━━━━━━━━━━
_Buka dashboard Tokoku untuk proses pengiriman!_`,
    templateChat: `*💬 [CHAT BARU ITEMKU]*
━━━━━━━━━━━━━━━━━━━━
*Dari:* {buyer_name}
*Pesan:* "{message}"
━━━━━━━━━━━━━━━━━━━━`,
    templateDispute: `*🚨 [KENDALA PESANAN ITEMKU] ⚠️*
━━━━━━━━━━━━━━━━━━━━
*Order:* {order_number}
*Pembeli:* {buyer_name}
*Kendala:* {reason}
*Status:* DANA DITAHAN ITEMKU
━━━━━━━━━━━━━━━━━━━━`,
  },
  alerts: {
    soundEnabled: true,
    soundVolume: 0.85,
    desktopNotification: true,
    notifyOrders: true,
    notifyChat: true,
    notifyDisputes: true,
  },
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format required_information from API (supports both JSON object and Format 1 / Format 2 strings from Doc page 49)
 */
export function formatRequiredInfo(reqInfo: Record<string, string> | string | undefined): string {
  if (!reqInfo) return '-';
  if (typeof reqInfo === 'string') {
    try {
      const parsed = JSON.parse(reqInfo);
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
      }
      return reqInfo;
    } catch {
      return reqInfo;
    }
  }
  return Object.entries(reqInfo)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}
