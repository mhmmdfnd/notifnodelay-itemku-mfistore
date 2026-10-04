// Types based on Official Tokoku API Documentation

export type OrderStatus = 'REQUIRE_PROCESS' | 'DELIVERED' | 'REFUNDED';

export type RefundReason = 
  | 'NO_STOCK'
  | 'WRONG_BUYER_INFORMATION'
  | 'SERVER_ERROR'
  | 'PRICE_CHANGED'
  | 'BUYER_UNREACHABLE'
  | 'BUYER_DOES_NOT_UNDESTAND_TRADING'
  | 'SHOP_UNDER_MODERATION'
  | 'JOKI_QUEUE_FULL'
  | 'BUYER_ACCOUNT_NOT_ELIGIBLE'
  | 'WRONG_VERIFICATION_CODE';

export interface DeliveryInfoField {
  field_name: string;
  validation_pattern?: string;
}

export interface TokokuOrder {
  order_id: number;
  order_number: string;
  product_id: number;
  price: number;
  quantity: number;
  order_income: number;
  is_from_ads?: boolean;
  ads_fee?: number;
  game_name: string;
  product_name: string;
  status: OrderStatus;
  required_information: Record<string, string> | string;
  using_delivery_info: boolean;
  delivery_info_field?: DeliveryInfoField[] | null;
  delivery_info?: string[] | Record<string, string>[] | null;
  order_created_at: string;
  order_created_epoch?: number;
  order_delivered_at?: string;
  order_delivered_epoch?: number;
  country?: string;
  buyer_name: string;
  category_name?: string;
}

export interface BuyerChat {
  id: string;
  buyer_name: string;
  game_name: string;
  product_name: string;
  order_number?: string;
  last_message: string;
  timestamp: string;
  unread: boolean;
  messages: {
    sender: 'buyer' | 'seller';
    text: string;
    time: string;
  }[];
}

export interface OrderDispute {
  id: string;
  order_id: number;
  order_number: string;
  buyer_name: string;
  game_name: string;
  product_name: string;
  amount: number;
  reason: string;
  status: 'PENDING_SELLER' | 'UNDER_REVIEW' | 'RESOLVED';
  created_at: string;
  sla_hours_left: number;
  unread: boolean;
}

export interface SellerConfig {
  itemku: {
    apiKey: string;
    secretKey: string;
    shopName: string;
    webhookUrl: string;
    dnsVerified: boolean;
    pollIntervalSeconds: number;
    isActive: boolean;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    soundAlert: boolean;
    templateOrder: string;
    templateChat: string;
    templateDispute: string;
  };
  whatsapp: {
    enabled: boolean;
    provider: 'fonnte' | 'wablas' | 'custom';
    token: string;
    targetPhone: string;
    customUrl?: string;
    templateOrder: string;
    templateChat: string;
    templateDispute: string;
  };
  alerts: {
    soundEnabled: boolean;
    soundVolume: number;
    desktopNotification: boolean;
    notifyOrders: boolean;
    notifyChat: boolean;
    notifyDisputes: boolean;
  };
}
