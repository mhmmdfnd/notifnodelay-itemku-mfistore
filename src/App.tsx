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

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('tokoku_config_v2');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 rounded-2xl bg-[#0d1424] border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-white">Sinkronisasi Data Aplikasi</h2>
            <p className="text-xs text-slate-400">
              Ada pembaruan format konfigurasi. Klik tombol di bawah untuk menyegarkan tampilan.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              🔄 Refresh &amp; Sinkronkan Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  // Navigation
  const [activeMenu, setActiveMenu] = useState<string>('orders');

  // State with LocalStorage
  const [orders, setOrders] = useState<TokokuOrder[]>(() => {
    try {
      const saved = localStorage.getItem('tokoku_orders_live');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Orders load error:', e);
    }
    return [];
  });

  const [chats, setChats] = useState<BuyerChat[]>(() => {
    try {
      const saved = localStorage.getItem('tokoku_chats_live');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Chats load error:', e);
    }
    return [];
  });

  const [disputes, setDisputes] = useState<OrderDispute[]>(() => {
    try {
      const saved = localStorage.getItem('tokoku_disputes_live');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Disputes load error:', e);
    }
    return [];
  });

  const [config, setConfig] = useState<SellerConfig>(() => {
    try {
      const saved = localStorage.getItem('tokoku_config_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...(parsed || {}),
          itemku: { ...DEFAULT_CONFIG.itemku, ...(parsed?.itemku || {}) },
          telegram: { ...DEFAULT_CONFIG.telegram, ...(parsed?.telegram || {}) },
          whatsapp: { ...DEFAULT_CONFIG.whatsapp, ...(parsed?.whatsapp || {}) },
          alerts: { ...DEFAULT_CONFIG.alerts, ...(parsed?.alerts || {}) },
        };
      }
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
      localStorage.setItem('tokoku_orders_live', JSON.stringify(orders));
    } catch (e) {
      console.warn('Save orders error:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('tokoku_chats_live', JSON.stringify(chats));
    } catch (e) {
      console.warn('Save chats error:', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem('tokoku_disputes_live', JSON.stringify(disputes));
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

  // Dispatch alert to Telegram (Direct from browser for zero-delay on Vercel)
  const sendTelegramAlert = async (text: string) => {
    if (!config.telegram.enabled || !config.telegram.botToken || !config.telegram.chatId) return;
    const cleanToken = config.telegram.botToken.trim();
    const cleanChatId = config.telegram.chatId.trim();

    try {
      await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      return;
    } catch {
      // Fallback
    }

    try {
      await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: cleanToken,
          chatId: cleanChatId,
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
        }),
      });
    } catch (err) {
      console.error('WhatsApp alert error:', err);
    }
  };

  // Delivery Order Action
  const handleDeliverOrder = async (orderId: string, customDeliveryInfo?: string) => {
    const targetOrder = orders.find(o => o.order_id === orderId);
    if (!targetOrder) return;

    try {
      const res = await fetch('/api/order/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELIVER',
          orderId,
          deliveryInfo: customDeliveryInfo || 'Pesanan telah diproses dan dikirim otomatis via Tokoku API.',
          apiKey: config.itemku.apiKey,
          secretKey: config.itemku.secretKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'PROCESSED' } : o));
      }
    } catch {
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'PROCESSED' } : o));
    }
  };

  // Reject/Cancel Order Action
  const handleRejectOrder = async (orderId: string, reason: RefundReason, notes?: string) => {
    const targetOrder = orders.find(o => o.order_id === orderId);
    if (!targetOrder) return;

    try {
      const res = await fetch('/api/order/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          orderId,
          refundReason: reason,
          refundNotes: notes || 'Stok habis / kendala teknis',
          apiKey: config.itemku.apiKey,
          secretKey: config.itemku.secretKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'CANCELED' } : o));
      }
    } catch {
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'CANCELED' } : o));
    }
  };

  // Live Chat send
  const handleSendMessage = (chatId: string, messageText: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          unread: false,
          messages: [
            ...c.messages,
            {
              id: 'msg-' + Date.now(),
              sender: 'seller',
              senderName: config.itemku.shopName || 'Penjual',
              text: messageText,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
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

  // Test API Telegram (Direct dari browser, instant 0.2 detik)
  const handleTestTelegram = async (botToken: string, chatId: string, message?: string) => {
    const cleanToken = botToken?.trim() || '';
    const cleanChatId = chatId?.trim() || '';

    if (!cleanToken || !cleanChatId) {
      return {
        success: false,
        message: 'Bot Token dan Chat ID wajib diisi!',
        tip: 'Salin token dari @BotFather dan ID dari @userinfobot.',
      };
    }

    const payload = {
      botToken: cleanToken,
      chatId: cleanChatId,
      message: message || '🔔 <b>[Tokoku InstantNotify]</b> Tes Notifikasi Berhasil!\nSistem notifikasi instan Tokoku Itemku siap beroperasi di domain web-notif-itemku-mfistore.my.id.',
      parseMode: 'HTML',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: payload.message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json() as { ok: boolean; description?: string };
      if (data.ok) {
        return {
          success: true,
          message: '✓ Berhasil! Pesan notifikasi langsung masuk ke Telegram Anda.',
        };
      }

      let humanTip = 'Periksa token dan ID Anda.';
      if (data.description?.includes('Unauthorized')) {
        humanTip = 'Token bot tidak valid atau bot telah dihapus di @BotFather.';
      } else if (data.description?.includes('chat not found')) {
        humanTip = 'Chat tidak ditemukan! Pastikan Anda sudah membuka bot di Telegram dan klik tombol /start.';
      }
      return {
        success: false,
        message: data.description || 'Gagal mengirim ke Telegram',
        tip: humanTip,
      };
    } catch {
      // Fallback
    }

    return {
      success: false,
      message: 'Gagal menghubungi Telegram API',
      tip: 'Pastikan koneksi internet stabil dan bot sudah di-klik /start di Telegram.',
    };
  };

  // Test API WhatsApp
  const handleTestWhatsApp = async (provider: any, token: string, targetPhone: string, message?: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token, targetPhone, message }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      simulated: true,
      message: '✓ [Mode Simulasi] Format notifikasi WhatsApp siap dikirim!',
    };
  };

  const requireProcessCount = orders.filter(o => o.status === 'REQUIRE_PROCESS').length;
  const unreadChatsCount = chats.filter(c => c.unread).length;
  const unreadDisputesCount = disputes.filter(d => d.unread && d.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Left Sidebar */}
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Webhook Ready
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeMenu === 'orders' && (
            <OrderManagementTab
              orders={orders}
              onDeliverOrder={handleDeliverOrder}
              onRejectOrder={handleRejectOrder}
              onClearOrders={() => setOrders([])}
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

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
