import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Bell
} from 'lucide-react';
import { SellerConfig } from '../../types';

interface NotificationTabProps {
  config: SellerConfig;
  setConfig: React.Dispatch<React.SetStateAction<SellerConfig>>;
  onTestTelegram: (token: string, chatId: string, message?: string) => Promise<{ success: boolean; message?: string; tip?: string }>;
  onTestWhatsApp: (provider: any, token: string, targetPhone: string, message?: string) => Promise<{ success: boolean; simulated?: boolean; message?: string; tip?: string }>;
  onTestSound: () => void;
  onRequestDesktopNotif: () => void;
  desktopNotifGranted: boolean;
}

export const NotificationTab: React.FC<NotificationTabProps> = ({
  config,
  setConfig,
  onTestTelegram,
  onTestWhatsApp,
  onTestSound,
  onRequestDesktopNotif,
  desktopNotifGranted,
}) => {
  const [subTab, setSubTab] = useState<'telegram' | 'whatsapp'>('telegram');
  const [showTgToken, setShowTgToken] = useState(false);
  const [showWaToken, setShowWaToken] = useState(false);
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [tgResult, setTgResult] = useState<{ success?: boolean; message?: string; tip?: string } | null>(null);
  const [waResult, setWaResult] = useState<{ success?: boolean; simulated?: boolean; message?: string; tip?: string } | null>(null);

  const handleTestTg = async () => {
    setIsTestingTg(true);
    setTgResult(null);
    const res = await onTestTelegram(
      config.telegram.botToken,
      config.telegram.chatId,
      '🔔 <b>[Tokoku InstantNotify]</b> Tes Notifikasi Berhasil! Pesanan & chat akan masuk tanpa delay.'
    );
    setTgResult(res);
    setIsTestingTg(false);
  };

  const handleTestWa = async () => {
    setIsTestingWa(true);
    setWaResult(null);
    const res = await onTestWhatsApp(
      config.whatsapp.provider,
      config.whatsapp.token,
      config.whatsapp.targetPhone,
      '*🔔 [TOKOKU INSTANTNOTIFY]*\n\nTes notifikasi WhatsApp berhasil! Pesanan Itemku akan dikirimkan secara instan.'
    );
    setWaResult(res);
    setIsTestingWa(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            Integrasi Notifikasi Instan: Telegram &amp; WhatsApp
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dapatkan peringatan pesanan baru, chat pembeli, dan kendala pesanan tanpa delay di smartphone Anda.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRequestDesktopNotif}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              desktopNotifGranted 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' 
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {desktopNotifGranted ? '✓ Desktop Push Aktif' : 'Aktifkan Push Notif'}
          </button>

          <button
            onClick={onTestSound}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Tes Alarm</span>
          </button>
        </div>
      </div>

      {/* Channel Switcher */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs sm:text-sm font-semibold max-w-md">
        <button
          onClick={() => setSubTab('telegram')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
            subTab === 'telegram' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Telegram Bot (Respon &lt; 0.5s)</span>
        </button>

        <button
          onClick={() => setSubTab('whatsapp')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
            subTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Gateway</span>
        </button>
      </div>

      {/* SubTab 1: Telegram */}
      {subTab === 'telegram' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                Pengaturan Bot Telegram
              </h3>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Buka @BotFather</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Bot Token</label>
              <div className="relative">
                <input
                  type={showTgToken ? 'text' : 'password'}
                  value={config.telegram.botToken}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    telegram: { ...prev.telegram, botToken: e.target.value }
                  }))}
                  placeholder="Contoh: 7123456789:AAHkL789123xyz_example"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowTgToken(!showTgToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showTgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Chat ID / Group ID</label>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Cek ID via @userinfobot</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={config.telegram.chatId}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  telegram: { ...prev.telegram, chatId: e.target.value }
                }))}
                placeholder="Contoh: 123456789 atau -100123456789"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleTestTg}
              disabled={isTestingTg}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isTestingTg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Tes Kirim ke Telegram Sekarang</span>
            </button>

            {tgResult && (
              <div className={`p-3 rounded-xl border text-xs ${
                tgResult.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-red-950/40 border-red-800 text-red-200'
              }`}>
                <p className="font-semibold">{tgResult.message}</p>
                {tgResult.tip && <p className="text-[11px] mt-1 text-slate-300">{tgResult.tip}</p>}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs space-y-3">
            <h4 className="font-bold text-white">Panduan Bot Telegram:</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>Kirim <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">/newbot</code> ke @BotFather di Telegram.</li>
              <li>Salin <strong>HTTP API Token</strong> dan masukkan di kolom kiri.</li>
              <li>Cek ID akun Anda di @userinfobot dan tempelkan.</li>
              <li><strong>Penting:</strong> Buka bot Anda dan klik <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">/start</code> satu kali.</li>
            </ol>
          </div>
        </div>
      )}

      {/* SubTab 2: WhatsApp */}
      {subTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Pengaturan WhatsApp Gateway
              </h3>
              <a
                href="https://fonnte.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Daftar Fonnte (Gratis)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Nomor WhatsApp Tujuan (Admin/Pribadi)</label>
              <input
                type="text"
                value={config.whatsapp.targetPhone}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  whatsapp: { ...prev.whatsapp, targetPhone: e.target.value }
                }))}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Fonnte API Token</label>
              <div className="relative">
                <input
                  type={showWaToken ? 'text' : 'password'}
                  value={config.whatsapp.token}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, token: e.target.value }
                  }))}
                  placeholder="Token device dari dashboard Fonnte"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowWaToken(!showWaToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showWaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleTestWa}
              disabled={isTestingWa}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isTestingWa ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              <span>Tes Kirim ke WhatsApp Sekarang</span>
            </button>

            {waResult && (
              <div className={`p-3 rounded-xl border text-xs ${
                waResult.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-red-950/40 border-red-800 text-red-200'
              }`}>
                <p className="font-semibold">{waResult.message}</p>
                {waResult.simulated && (
                  <p className="text-[11px] text-amber-300 mt-1">Mode Simulasi aktif. Masukkan Token Fonnte agar masuk ke WhatsApp asli.</p>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs space-y-3">
            <h4 className="font-bold text-white">Panduan WhatsApp Fonnte:</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>Buka <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">fonnte.com</a> &amp; buat akun gratis.</li>
              <li>Scan QR Code dengan WhatsApp di menu <strong>Device</strong>.</li>
              <li>Salin <strong>Token</strong> yang muncul lalu masukkan ke form di sebelah kiri.</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  );
};
