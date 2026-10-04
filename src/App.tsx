/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { OrderManagementTab } from './components/tabs/OrderManagementTab';
import { ProfitAnalysisTab } from './components/tabs/ProfitAnalysisTab';
import { LiveChatTab } from './components/tabs/LiveChatTab';
import { DisputeTab } from './components/tabs/DisputeTab';
import { NotificationTab } from './components/tabs/NotificationTab';
import { TokokuSetupTab } from './components/tabs/TokokuSetupTab';

import { TokokuOrder, BuyerChat, OrderDispute, SellerConfig, RefundReason } from './types';
import { INITIAL_ORDERS, INITIAL_CHATS, INITIAL_DISPUTES, DEFAULT_CONFIG } from './utils/constants';
import { 
  playOrderSound, 
  playChatSound, 
  playDisputeAlarm, 
  requestDesktopNotificationPermission, 
  triggerDesktopNotification 
} from './utils/sound';

export default function App() {
  // Navigation
  const [activeMenu, setActiveMenu] = useState<string>('orders');

  // State with LocalStorage
  const [orders, setOrders] = useState<TokokuOrder[]>(() => {
    try {
      const saved = localStorage.getItem('tokoku_orders_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Orders load error:', e);
    }
    return INITIAL_ORDERS;
  });

  const [chats, setChats] = useState<BuyerChat[]>(() => {
    try {
      const saved = localStorage.getItem('tokoku_chats_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Chats load error:', e);
    }
    return INITIAL_CHATS;
  });

  const [disputes, setDisputes] = useState<OrderDispute[]>(() => {
    try {
      const saved = localStorage.getItem('tokoku_disputes_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Disputes load error:', e);
    }
    return INITIAL_DISPUTES;
  });

  const [config, setConfig] = useState<SellerConfig>(() => {
    try {
      const saved = localStorage.getItem('tokoku_config_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Config load error:', e);
    }
    return DEFAULT_CONFIG;
  });

  const [desktopNotifGranted, setDesktopNotifGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('tokoku_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.warn('Save orders error:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('tokoku_chats_v2', JSON.stringify(chats));
    } catch (e) {
      console.warn('Save chats error:', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem('tokoku_disputes_v2', JSON.stringify(disputes));
    } catch (e) {
      console.warn('Save disputes error:', e);
    }
  }, [disputes]);

  useEffect(() => {
    try {
      localStorage.setItem('tokoku_config_v2', JSON.stringify(config));
    } catch (e) {
      console.warn('Save config error:', e);
    }
  }, [config]);

  // Request desktop notification
  const handleRequestDesktopNotif = async () => {
    const granted = await requestDesktopNotificationPermission();
    setDesktopNotifGranted(granted);
    if (granted) {
      triggerDesktopNotification(
        '🔔 Tokoku InstantNotify Aktif',
        'Notifikasi pesanan, chat & kendala Itemku akan muncul langsung di layar desktop Anda!'
      );
    }
  };

  // Sound test
  const handleTestSound = () => {
    playOrderSound(config.alerts.soundVolume);
  };

  // Dispatch alert to Telegram
  const sendTelegramAlert = async (text: string) => {
    if (!config.telegram.enabled || !config.telegram.botToken || !config.telegram.chatId) return;
    try {
      await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: config.telegram.botToken,
          chatId: config.telegram.chatId,
          message: text,
          parseMode: 'HTML',
        }),
      });
    } catch (err) {
      console.error('Telegram alert error:', err);
    }
  };

  // Dispatch alert to WhatsApp
  const sendWhatsAppAlert = async (text: string) => {
    if (!config.whatsapp.enabled || !config.whatsapp.targetPhone) return;
    try {
      await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.whatsapp.provider,
          token: config.whatsapp.token,
          targetPhone: config.whatsapp.targetPhone,
          message: text,
          customUrl: config.whatsapp.customUrl,
        }),
      });
    } catch (err) {
      console.error('WhatsApp alert error:', err);
    }
  };

  // Deliver an order (DELIVER)
  const handleDeliverOrder = async (orderId: number, deliveryInfo?: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/order/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.itemku.apiKey,
          secretKey: config.itemku.secretKey,
          order_id: orderId,
          action: 'DELIVER',
          delivery_info: deliveryInfo,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'DELIVERED', order_delivered_at: new Date().toISOString() } : o));
        if (config.alerts.soundEnabled) playOrderSound(config.alerts.soundVolume);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Deliver order error:', err);
      return false;
    }
  };

  // Reject an order (REJECT)
  const handleRejectOrder = async (orderId: number, refundReason: RefundReason): Promise<boolean> => {
    try {
      const res = await fetch('/api/order/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.itemku.apiKey,
          secretKey: config.itemku.secretKey,
          order_id: orderId,
          action: 'REJECT',
          refund_reason: refundReason,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'REFUNDED' } : o));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Reject order error:', err);
      return false;
    }
  };

  // Simulate new incoming order via Sandbox API
  const handleSimulateOrder = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `OD00000${randomNum}`;
    const orderId = randomNum;

    const sampleVariants: { game: string; prod: string; price: number; income: number; req: Record<string, string>; buyer: string }[] = [
      {
        game: 'Mobile Legends',
        prod: 'Mobile Legends - Top Up 296 Diamonds',
        price: 79500,
        income: 76000,
        req: { player_id: '99812734', zone_id: '2104' },
        buyer: 'Budi_Santoso',
      },
      {
        game: 'Roblox',
        prod: 'Roblox - Robux 1.000 (Gamepass 5 Hari)',
        price: 145000,
        income: 139000,
        req: { username: 'kevin_robloxian' },
        buyer: 'Kevin_Gamer',
      },
      {
        game: 'Growtopia',
        prod: 'Growtopia - 100 World Lock',
        price: 56000,
        income: 53500,
        req: { player_id: 'RayStore', zone_id: 'WORLD_TRADE_99' },
        buyer: 'Ray_GT',
      },
    ];

    const pick = sampleVariants[Math.floor(Math.random() * sampleVariants.length)];

    const newOrder: TokokuOrder = {
      order_id: orderId,
      order_number: orderNumber,
      product_id: 11029,
      price: pick.price,
      quantity: 1,
      order_income: pick.income,
      game_name: pick.game,
      product_name: pick.prod,
      status: 'REQUIRE_PROCESS',
      required_information: pick.req,
      using_delivery_info: false,
      delivery_info_field: null,
      order_created_at: new Date().toISOString(),
      country: 'ID',
      buyer_name: pick.buyer,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Play instant order sound
    if (config.alerts.soundEnabled) {
      playOrderSound(config.alerts.soundVolume);
    }

    // Trigger desktop notification
    if (config.alerts.desktopNotification) {
      triggerDesktopNotification(
        `🛒 Pesanan Baru: ${pick.prod}`,
        `No: ${orderNumber} | Pembeli: ${pick.buyer} | Total: Rp ${pick.price.toLocaleString('id-ID')}`
      );
    }

    // Dispatch real Telegram & WhatsApp
    const alertMsg = `🛒 <b>[PESANAN BARU TOKOKU]</b> ⚡\n━━━━━━━━━━━━━━━━━━━━\n<b>Order ID:</b> <code>${orderNumber}</code>\n<b>Produk:</b> ${pick.prod}\n<b>Pembeli:</b> ${pick.buyer}\n<b>Total:</b> Rp ${pick.price.toLocaleString('id-ID')}\n<b>Waktu:</b> ${new Date().toLocaleTimeString('id-ID')} WIB\n━━━━━━━━━━━━━━━━━━━━\n<i>Segera proses pesanan di dashboard Tokoku API!</i>`;
    sendTelegramAlert(alertMsg);

    const waMsg = `*🛒 [PESANAN BARU TOKOKU] ⚡*\n━━━━━━━━━━━━━━━━━━━━\n*Order ID:* ${orderNumber}\n*Produk:* ${pick.prod}\n*Pembeli:* ${pick.buyer}\n*Total:* Rp ${pick.price.toLocaleString('id-ID')}\n━━━━━━━━━━━━━━━━━━━━\n_Segera kirim pesanan di dashboard!_`;
    sendWhatsAppAlert(waMsg);
  };

  // Chat message send
  const handleSendMessage = (chatId: string, text: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          last_message: text,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          messages: [
            ...c.messages,
            { sender: 'seller', text, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return c;
    }));
  };

  const handleMarkChatAsRead = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: false } : c));
  };

  const handleResolveDispute = (id: string, solutionText: string) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'RESOLVED', unread: false } : d));
  };

  // Test API calls
  const handleTestTelegram = async (botToken: string, chatId: string, message?: string) => {
    const res = await fetch('/api/test-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken, chatId, message, parseMode: 'HTML' }),
    });
    return res.json();
  };

  const handleTestWhatsApp = async (provider: any, token: string, targetPhone: string, message?: string) => {
    const res = await fetch('/api/test-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, token, targetPhone, message }),
    });
    return res.json();
  };

  const requireProcessCount = orders.filter(o => o.status === 'REQUIRE_PROCESS').length;
  const unreadChatsCount = chats.filter(c => c.unread).length;
  const unreadDisputesCount = disputes.filter(d => d.unread && d.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Left Sidebar matching user screenshot */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        requireProcessCount={requireProcessCount}
        unreadChatsCount={unreadChatsCount}
        unreadDisputesCount={unreadDisputesCount}
        config={config}
        setConfig={setConfig}
        onTestSound={handleTestSound}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#0a0f1c]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
              API GATEWAY
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              tokoku-gateway.itemku.com • Polling 1.0s (Zero-Delay)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Webhook Ready
            </div>

            <button
              onClick={handleSimulateOrder}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition shadow-sm"
            >
              + Simulasi Order
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeMenu === 'orders' && (
            <OrderManagementTab
              orders={orders}
              onDeliverOrder={handleDeliverOrder}
              onRejectOrder={handleRejectOrder}
              onSimulateOrder={handleSimulateOrder}
            />
          )}

          {activeMenu === 'analytics' && (
            <ProfitAnalysisTab orders={orders} />
          )}

          {activeMenu === 'chat' && (
            <LiveChatTab
              chats={chats}
              onSendMessage={handleSendMessage}
              onMarkChatAsRead={handleMarkChatAsRead}
            />
          )}

          {activeMenu === 'disputes' && (
            <DisputeTab
              disputes={disputes}
              onResolveDispute={handleResolveDispute}
            />
          )}

          {activeMenu === 'notifications' && (
            <NotificationTab
              config={config}
              setConfig={setConfig}
              onTestTelegram={handleTestTelegram}
              onTestWhatsApp={handleTestWhatsApp}
              onTestSound={handleTestSound}
              onRequestDesktopNotif={handleRequestDesktopNotif}
              desktopNotifGranted={desktopNotifGranted}
            />
          )}

          {activeMenu === 'api-setup' && (
            <TokokuSetupTab
              config={config}
              setConfig={setConfig}
            />
          )}
        </main>

      </div>

    </div>
  );
}
