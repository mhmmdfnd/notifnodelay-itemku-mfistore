import React from 'react';
import { 
  Package, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle, 
  Bell, 
  Key, 
  ShieldCheck, 
  Radio,
  ExternalLink,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SellerConfig } from '../types';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  requireProcessCount: number;
  unreadChatsCount: number;
  unreadDisputesCount: number;
  config: SellerConfig;
  setConfig: React.Dispatch<React.SetStateAction<SellerConfig>>;
  onTestSound: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  requireProcessCount,
  unreadChatsCount,
  unreadDisputesCount,
  config,
  setConfig,
  onTestSound,
}) => {
  const menuItems = [
    {
      id: 'orders',
      label: 'Manajemen Order Tokoku',
      icon: Package,
      badge: requireProcessCount > 0 ? requireProcessCount : null,
      badgeColor: 'bg-red-500 text-white font-bold',
    },
    {
      id: 'analytics',
      label: 'Analisis Keuntungan',
      icon: TrendingUp,
    },
    {
      id: 'chat',
      label: 'Live Chat Pembeli',
      icon: MessageSquare,
      badge: unreadChatsCount > 0 ? unreadChatsCount : null,
      badgeColor: 'bg-red-500 text-white font-bold',
    },
    {
      id: 'disputes',
      label: 'Kendala Pesanan',
      icon: AlertTriangle,
      badge: unreadDisputesCount > 0 ? unreadDisputesCount : null,
      badgeColor: 'bg-red-500 text-white font-bold',
    },
    {
      id: 'notifications',
      label: 'Notifikasi WA & Telegram',
      icon: Bell,
    },
    {
      id: 'api-setup',
      label: 'Tokoku API & DNS Setup',
      icon: Key,
    },
  ];

  const toggleSound = () => {
    setConfig(prev => ({
      ...prev,
      alerts: { ...prev.alerts, soundEnabled: !prev.alerts.soundEnabled }
    }));
  };

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen text-slate-300">
      
      {/* Brand & Store Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              TOKOKU API &amp; STORE
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-white font-mono">
                {config.itemku.shopName || 'vercelpro'}
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                PRO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#121c29] text-white border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] min-w-[18px] text-center font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* DNS & Webhook Status Widget */}
      <div className="p-3 m-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">DNS TXT Webhook:</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
            VERIFIED
          </span>
        </div>
        <p className="text-[10px] font-mono text-slate-400 truncate bg-slate-950 p-1 rounded">
          v-api-itemku-{config.itemku.shopName}=1
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Zero-Delay Active
          </div>

          <button
            onClick={toggleSound}
            title={config.alerts.soundEnabled ? 'Bunyikan alarm (Aktif)' : 'Alarm dibisukan'}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            {config.alerts.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <a 
          href="https://tokoku.itemku.com" 
          target="_blank" 
          rel="noreferrer"
          className="text-slate-400 hover:text-teal-400 flex items-center gap-1.5 transition"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Buka Tokoku Seller</span>
        </a>
      </div>

    </aside>
  );
};
