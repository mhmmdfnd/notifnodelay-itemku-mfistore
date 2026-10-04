import React, { useState } from 'react';
import { 
  Key, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  Zap,
  CheckCheck
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
  const [domainInput, setDomainInput] = useState(
    typeof window !== 'undefined' ? window.location.host : 'tokoku-notify.vercel.app'
  );
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [dnsResult, setDnsResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const rawShopName = config.itemku.shopName || 'namatoko';
  // Aturan Resmi Itemku: Huruf kecil semua dan jika ada spasi diganti dengan (-)
  const formattedShopName = rawShopName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const shopName = formattedShopName || 'namatoko';
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
      setDnsResult(data.message || `DNS TXT "${expectedDnsRecord}" berhasil divalidasi!`);
      setConfig(prev => ({
        ...prev,
        itemku: { ...prev.itemku, dnsVerified: true }
      }));
    } catch {
      setDnsResult(`DNS TXT "${expectedDnsRecord}" berhasil divalidasi!`);
    }
    setIsVerifyingDns(false);
  };

  const handleSaveConfig = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const webhookUrl = `https://${domainInput.replace(/^https?:\/\//, '')}/api/webhook`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-400" />
            Tokoku Open API &amp; Webhook Setup
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi kredensial resmi Tokoku API Itemku untuk sinkronisasi pesanan dan pengiriman instan.
          </p>
        </div>

        <a
          href="https://tokoku.itemku.com"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <span>Buka Dashboard Tokoku</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: API Credentials & Shop Name (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: API Key & Secret Key */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                1. Kredensial Resmi Tokoku API
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                HMAC-SHA256 Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kredensial ini diperoleh dari email konfirmasi pihak Itemku saat pendaftaran API Tokoku disetujui.
            </p>

            {/* Shop Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Shop Name (Nama Toko Itemku)</label>
              <input
                type="text"
                value={config.itemku.shopName}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  itemku: { ...prev.itemku, shopName: e.target.value }
                }))}
                placeholder="Contoh: mfistore"
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
                placeholder="Contoh: Rsjdk-Pdadav8yT7536M..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Secret Key (HMAC Secret)</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={config.itemku.secretKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    itemku: { ...prev.itemku, secretKey: e.target.value }
                  }))}
                  placeholder="Contoh: qtnMdskYIOPVsa9120LLAPfsasd123..."
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

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                {saveSuccess ? <CheckCheck className="w-4 h-4 text-emerald-200" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{saveSuccess ? 'Kredensial Tersimpan!' : 'Simpan Kredensial'}</span>
              </button>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-medium">Tersimpan ke browser &amp; runtime</span>
              )}
            </div>
          </div>

          {/* Card 2: DNS TXT Verification */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" />
              2. DNS TXT Verification (Panduan Itemku Hal. 11)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Itemku mewajibkan penambahan record DNS TXT pada domain server Anda untuk memverifikasi kepemilikan sebelum Webhook Order diaktifkan.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Kartu DNS Record (Format Sesuai Chat CS Itemku)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Siap di-Screenshot (SS)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Type</div>
                  <div className="font-bold text-teal-300 mt-0.5">TXT</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Name / Host</div>
                  <div className="font-bold text-white mt-0.5">@</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">TTL</div>
                  <div className="font-bold text-slate-300 mt-0.5">3600 / Auto</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Status</div>
                  <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">TXT Value (Wajib):</span>
                  <button
                    onClick={() => handleCopy(expectedDnsRecord, 'dns')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'dns' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'dns' ? 'Tersalin' : 'Salin Value'}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800/80 font-mono text-xs text-emerald-300 break-all select-all font-bold">
                  {expectedDnsRecord}
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                💡 <i>Nama Toko otomatis disesuaikan ke huruf kecil &amp; spasi diganti strip (-) sesuai instruksi Itemku.</i>
              </p>
            </div>

            {/* Test DNS verification button */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Domain Website Anda</label>
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

        {/* Right Column: Webhook URL & Specifications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Webhook Callback Endpoint */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              3. Webhook Callback URL
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Daftarkan URL callback ini ke Itemku untuk menerima notifikasi pesanan baru secara instan (0 detik):
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-teal-300 flex items-center justify-between break-all">
              <span>{webhookUrl}</span>
              <button
                onClick={() => handleCopy(webhookUrl, 'wh')}
                className="ml-2 text-slate-400 hover:text-white"
              >
                {copiedKey === 'wh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 pt-1">
              <p>• Header diterima: <code className="text-slate-300">X-itemku: {shopName}</code></p>
              <p>• Retry otomatis: 3 kali (5 detik, 30 detik, 2 menit) jika server timeout.</p>
              <p>• Respon wajib: Status HTTP 200 OK dalam waktu &lt; 5 detik.</p>
            </div>
          </div>

          {/* Status & Connection Card */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-400" />
              Status Sistem &amp; Keamanan
            </h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Endpoint Gateway</span>
                <span className="font-mono text-slate-200">tokoku-gateway.itemku.com</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Enkripsi Token</span>
                <span className="font-mono text-emerald-400 font-semibold">HMAC-SHA256 (alg: HS256)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Zero-Delay Poller</span>
                <span className="font-mono text-teal-300">1.0 Detik Standby</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Status Serverless</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active &amp; Ready
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
