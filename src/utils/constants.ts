import { TokokuOrder, BuyerChat, OrderDispute, SellerConfig } from '../types';

export const INITIAL_ORDERS: TokokuOrder[] = [
  {
    order_id: 124634,
    order_number: 'OD00000124634',
    product_id: 88124,
    price: 250000,
    quantity: 1,
    order_income: 238000,
    is_from_ads: false,
    ads_fee: 0,
    game_name: 'Roblox',
    product_name: 'Roblox - Robux 5 Hari (Private Link)',
    status: 'REQUIRE_PROCESS',
    required_information: { username: 'vercelpro99' },
    using_delivery_info: false,
    delivery_info_field: null,
    order_created_at: '2026-10-04T10:14:00+07:00',
    country: 'ID',
    buyer_name: 'Rian Hidayat',
    category_name: 'Item, Roblox',
  },
  {
    order_id: 158494,
    order_number: 'OD00000158494',
    product_id: 88124,
    price: 250000,
    quantity: 1,
    order_income: 238000,
    is_from_ads: false,
    ads_fee: 0,
    game_name: 'Roblox',
    product_name: 'Roblox - Robux 5 Hari (Private Link)',
    status: 'REQUIRE_PROCESS',
    required_information: { username: 'vercelpro99' },
    using_delivery_info: false,
    delivery_info_field: null,
    order_created_at: '2026-10-04T10:25:00+07:00',
    country: 'ID',
    buyer_name: 'Rian Hidayat',
    category_name: 'Item, Roblox',
  },
  {
    order_id: 454634,
    order_number: 'OD00000454634',
    product_id: 235634,
    price: 700000,
    quantity: 1,
    order_income: 680000,
    is_from_ads: true,
    ads_fee: 10000,
    game_name: 'Mobile Legends',
    product_name: 'Mobile Legends - Top Up 3668 Diamonds',
    status: 'REQUIRE_PROCESS',
    required_information: { player_id: '12345567', zone_id: '1234' },
    using_delivery_info: false,
    delivery_info_field: null,
    order_created_at: '2026-10-04T10:48:00+07:00',
    country: 'ID',
    buyer_name: 'Rizky Pratama',
    category_name: 'Top Up, Mobile Legends',
  },
  {
    order_id: 454633,
    order_number: 'OD00000454633',
    product_id: 77412,
    price: 450000,
    quantity: 1,
    order_income: 430000,
    is_from_ads: false,
    ads_fee: 0,
    game_name: 'Valorant',
    product_name: 'Valorant - Akun Ascendant Vandal Reaver',
    status: 'DELIVERED',
    required_information: { email: 'buyer@gmail.com' },
    using_delivery_info: true,
    delivery_info_field: [
      { field_name: 'Username' },
      { field_name: 'Password' },
    ],
    delivery_info: [{ Username: 'riot_val_pro', Password: 'ValPassword#2026' }],
    order_created_at: '2026-10-04T09:30:00+07:00',
    order_delivered_at: '2026-10-04T09:34:00+07:00',
    country: 'ID',
    buyer_name: 'Dewi Lestari',
    category_name: 'Akun, Valorant',
  },
];

export const INITIAL_CHATS: BuyerChat[] = [
  {
    id: 'chat-1',
    buyer_name: 'Rian Hidayat',
    game_name: 'Roblox',
    product_name: 'Robux 5 Hari (Private Link)',
    order_number: 'OD00000124634',
    last_message: 'Halo min, orderan OD00000124634 sudah saya transfer tolong segera dicek yaa kak!',
    timestamp: '11:15 WIB',
    unread: true,
    messages: [
      { sender: 'buyer', text: 'Halo min, orderan OD00000124634 sudah saya transfer tolong segera dicek yaa kak!', time: '11:15' },
      { sender: 'seller', text: 'Halo kak Rian! Sedang kami verifikasi gamepassnya yaa, mohon ditunggu sebentar.', time: '11:16' },
      { sender: 'buyer', text: 'Oke min ditunggu, username vercelpro99 ya.', time: '11:17' }
    ]
  },
  {
    id: 'chat-2',
    buyer_name: 'Rizky Pratama',
    game_name: 'Mobile Legends',
    product_name: 'Top Up 3668 Diamonds',
    order_number: 'OD00000454634',
    last_message: 'Min diamondnya masuk berapa menit ya biasanya?',
    timestamp: '10:50 WIB',
    unread: false,
    messages: [
      { sender: 'buyer', text: 'Min diamondnya masuk berapa menit ya biasanya?', time: '10:50' },
      { sender: 'seller', text: 'Halo kak! Biasanya 1-3 menit langsung masuk ke akun MLBB kakak ya.', time: '10:51' }
    ]
  }
];

export const INITIAL_DISPUTES: OrderDispute[] = [
  {
    id: 'disp-1',
    order_id: 454633,
    order_number: 'OD00000454633',
    buyer_name: 'Dewi Lestari',
    game_name: 'Valorant',
    product_name: 'Valorant - Akun Ascendant Vandal Reaver',
    amount: 450000,
    reason: 'Pembeli melaporkan verifikasi 2FA aktif pada akun dan membutuhkan kode OTP login.',
    status: 'PENDING_SELLER',
    created_at: '2026-10-04T10:05:00+07:00',
    sla_hours_left: 22,
    unread: true,
  }
];

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
