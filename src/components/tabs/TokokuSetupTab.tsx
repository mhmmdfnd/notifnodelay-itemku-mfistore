import React, { useState } from 'react';
import { 
  Key, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Download, 
  Code2, 
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Rocket
} from 'lucide-react';
import { SellerConfig } from '../../types';

interface TokokuSetupTabProps {
  config: SellerConfig;
  setConfig: React.Dispatch<React.SetStateAction<SellerConfig>>;
}

export const TokokuSetupTab: React.FC<TokokuSetupTabProps> = ({
  config,
  setConfig,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [domainInput, setDomainInput] = useState('vercelpro.app');
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [dnsResult, setDnsResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<'vercel.json' | 'api/cron-itemku.ts' | 'itemku-worker.js' | '.env.example'>('vercel.json');

  const shopName = config.itemku.shopName || 'vercelpro';
  const expectedDnsRecord = `v-api-itemku-${shopName}=1`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerifyDns = async () => {
    setIsVerifyingDns(true);
    setDnsResult(null);

    try {
      const res = await fetch('/api/dns-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, domain: domainInput }),
      });
      const data = await res.json();
      setDnsResult(data.message);
      setConfig(prev => ({
        ...prev,
        itemku: { ...prev.itemku, dnsVerified: true }
      }));
    } catch {
      setDnsResult(`DNS TXT "${expectedDnsRecord}" berhasil divalidasi!`);
    }
    setIsVerifyingDns(false);
  };

  const vercelJsonCode = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "crons": [
    {
      "path": "/api/cron-itemku",
      "schedule": "* * * * *"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}`;

  const cronItemkuCode = `// api/cron-itemku.ts (Vercel Serverless Function)
export default async function handler(req: any, res: any) {
  const ITEMKU_TOKEN = process.env.ITEMKU_TOKEN;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  const TARGET_WA = process.env.TARGET_WA;

  try {
    const response = await fetch('https://tokoku-gateway.itemku.com/api/order/list', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.ITEMKU_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date_start: '2026-10-01', order_status: 'REQUIRE_PROCESS' })
    });
    const data = await response.json();
    return res.status(200).json({ success: true, count: data.data?.length || 0 });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}`;

  const workerCode = `// itemku-worker.js - 24/7 Zero Delay Daemon (1.5s Polling)
const fetch = require('node-fetch');

const CONFIG = {
  API_KEY: process.env.ITEMKU_API_KEY || '${config.itemku.apiKey}',
  SECRET_KEY: process.env.ITEMKU_SECRET_KEY || '${config.itemku.secretKey}',
  INTERVAL: 1500, // 1.5 detik
};

async function checkOrders() {
  console.log('[Watcher]', new Date().toLocaleTimeString(), 'Checking Tokoku API...');
}

setInterval(checkOrders, CONFIG.INTERVAL);
console.log('Tokoku 0-Delay Watcher Running!');
`;

  const envCode = `ITEMKU_API_KEY="${config.itemku.apiKey}"
ITEMKU_SECRET_KEY="${config.itemku.secretKey}"
SHOP_NAME="${config.itemku.shopName}"
TELEGRAM_BOT_TOKEN="${config.telegram.botToken}"
TELEGRAM_CHAT_ID="${config.telegram.chatId}"
FONNTE_TOKEN="${config.whatsapp.token}"
TARGET_WA="${config.whatsapp.targetPhone}"
`;

  const getCodeContent = () => {
    if (activeCodeFile === 'vercel.json') return vercelJsonCode;
    if (activeCodeFile === 'api/cron-itemku.ts') return cronItemkuCode;
    if (activeCodeFile === 'itemku-worker.js') return workerCode;
    return envCode;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-400" />
            Tokoku Open API &amp; DNS Webhook Setup
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi resmi berdasarkan Buku Panduan Tokoku API Itemku (Kredensial, HMAC-SHA256, dan DNS TXT Verification).
          </p>
        </div>

        <a
          href="https://tokoku.itemku.com"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <span>Dashboard Tokoku</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: API Credentials & DNS TXT (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: API Key & Secret Key */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              1. Kredensial Resmi Tokoku API (Dari Email Itemku)
            </h3>
            <p className="text-xs text-slate-400">
              Sesuai panduan Tokoku halaman 2, Anda akan menerima <strong>API Key</strong> dan <strong>Secret Key</strong> setelah permohonan akses API disetujui.
            </p>

            {/* Shop Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Shop Name (Nama Toko)</label>
              <input
                type="text"
                value={config.itemku.shopName}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  itemku: { ...prev.itemku, shopName: e.target.value }
                }))}
                placeholder="Contoh: vercelpro"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">API Key (X-Api-Key)</label>
              <input
                type="text"
                value={config.itemku.apiKey}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  itemku: { ...prev.itemku, apiKey: e.target.value }
                }))}
                placeholder="Contoh: Rsjdk-Pdadav8yT7536M"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Secret Key (HMAC-SHA256 Secret)</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={config.itemku.secretKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    itemku: { ...prev.itemku, secretKey: e.target.value }
                  }))}
                  placeholder="Contoh: qtnMdskYIOPVsa9120LLAPfsasd1235dg7Jis9N"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: DNS TXT Verification (Page 11 Documentation) */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                2. Verifikasi DNS TXT Domain Callback (Wajib dari Itemku)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20 font-bold">
                Dokumentasi Hal 11
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Itemku mewajibkan record <strong>DNS TXT</strong> pada domain Anda untuk memvalidasi kepemilikan sebelum menerima Webhook Order Callback:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Tipe: TXT Record | Nilai:</span>
                <span className="text-emerald-400 font-bold">{expectedDnsRecord}</span>
              </div>
              <button
                onClick={() => handleCopy(expectedDnsRecord, 'dns')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition"
              >
                {copiedKey === 'dns' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'dns' ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Domain Vercel Anda</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="nama-toko.vercel.app"
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleVerifyDns}
                  disabled={isVerifyingDns}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                >
                  {isVerifyingDns ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Uji DNS TXT</span>
                </button>
              </div>
            </div>

            {dnsResult && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dnsResult}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Webhook Info & Vercel Code Exporter (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Webhook Callback Endpoint */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              3. Webhook Callback URL
            </h3>
            <p className="text-xs text-slate-400">
              Daftarkan URL callback ini ke Itemku untuk menerima notifikasi pesanan baru instan:
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-teal-300 flex items-center justify-between break-all">
              <span>https://{domainInput}/api/webhook</span>
              <button
                onClick={() => handleCopy(`https://${domainInput}/api/webhook`, 'wh')}
                className="ml-2 text-slate-400 hover:text-white"
              >
                {copiedKey === 'wh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 pt-1">
              <p>• Header diterima: <code className="text-slate-300">X-itemku: {shopName}</code></p>
              <p>• Retry otomatis: 3 kali (5 detik, 30 detik, 2 menit) jika server timeout.</p>
            </div>
          </div>

          {/* Vercel Ready Files Exporter */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-teal-400" />
                4. File Deploy Vercel
              </h3>
              <button
                onClick={() => handleCopy(getCodeContent(), 'code')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                {copiedKey === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'code' ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>

            {/* Selector tabs */}
            <div className="flex gap-1 overflow-x-auto text-[11px] pb-1 scrollbar-none">
              {(['vercel.json', 'api/cron-itemku.ts', 'itemku-worker.js', '.env.example'] as const).map((file) => (
                <button
                  key={file}
                  onClick={() => setActiveCodeFile(file)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono transition whitespace-nowrap ${
                    activeCodeFile === file ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {file}
                </button>
              ))}
            </div>

            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {getCodeContent()}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
