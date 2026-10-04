import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Upload, 
  ExternalLink,
  Info,
  Send
} from 'lucide-react';
import { OrderDispute } from '../../types';
import { formatRupiah } from '../../utils/constants';

interface DisputeTabProps {
  disputes: OrderDispute[];
  onResolveDispute: (id: string, solutionText: string) => void;
}

export const DisputeTab: React.FC<DisputeTabProps> = ({
  disputes,
  onResolveDispute,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(disputes[0]?.id || '');
  const [responseMessage, setResponseMessage] = useState('');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const selectedCase = disputes.find(d => d.id === selectedCaseId) || disputes[0];

  const handleResolve = () => {
    if (!selectedCase) return;
    onResolveDispute(selectedCase.id, responseMessage || 'Masalah telah diselesaikan dengan pembeli.');
    setResolvedIds(prev => new Set(prev).add(selectedCase.id));
    setResponseMessage('');
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Header */}
      <div className="p-5 rounded-2xl bg-red-950/40 border border-red-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-red-950/20">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Pusat Penanganan Kendala &amp; Komplain Pesanan (Escrow Protection)
            </h2>
            <p className="text-xs text-red-200/80 mt-0.5">
              Dana pesanan yang mengalami kendala ditahan oleh sistem Itemku hingga penjual memberikan tanggapan atau solusi.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-mono text-xs font-bold border border-red-500/40 shrink-0">
          SLA Respon: Max 24 Jam
        </span>
      </div>

      {/* Main Dispute Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Cases List (5 cols) */}
        <div className="md:col-span-5 rounded-2xl bg-[#0d1424] border border-slate-800 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daftar Kasus Aktif ({disputes.length})
          </h3>

          <div className="space-y-2">
            {disputes.map((d) => {
              const isSelected = d.id === selectedCase?.id;
              const isResolved = resolvedIds.has(d.id);

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedCaseId(d.id)}
                  className={`w-full p-4 rounded-xl text-left border transition ${
                    isSelected 
                      ? 'bg-red-950/30 border-red-800/80 shadow-md' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white">{d.order_number}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isResolved 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-red-500/20 text-red-300 animate-pulse'
                    }`}>
                      {isResolved ? 'Selesai' : `${d.sla_hours_left} Jam Tersisa`}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200">{d.buyer_name}</div>
                  <div className="text-[11px] text-slate-400">{d.product_name}</div>

                  <p className="mt-2 text-xs text-red-300/90 line-clamp-2 italic bg-red-950/40 p-2 rounded-lg border border-red-900/40">
                    "{d.reason}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Case Detail & Action Panel (7 cols) */}
        <div className="md:col-span-7 rounded-2xl bg-[#0d1424] border border-slate-800 p-5 space-y-4">
          {selectedCase ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Detail Kasus #{selectedCase.order_number}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dilaporkan oleh <strong>{selectedCase.buyer_name}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {formatRupiah(selectedCase.amount)}
                  </div>
                  <div className="text-[10px] text-red-400 font-medium">Dana Ditahan</div>
                </div>
              </div>

              {/* Dispute Explanation */}
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/60 text-xs text-red-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Keterangan Komplain Pembeli:
                </span>
                <p className="leading-relaxed pl-5">{selectedCase.reason}</p>
              </div>

              {/* Resolution Form */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Kirim Tanggapan / Bukti ke Pembeli &amp; Admin Itemku:
                </label>
                <textarea
                  rows={4}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Ketik penjelasan, kode OTP baru, atau panduan verifikasi akun untuk pembeli..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-teal-400" />
                    <span>Respon akan diteruskan ke notifikasi pembeli</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResolve}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kirim Solusi &amp; Selesaikan</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Pilih kasus di sebelah kiri untuk melihat detailnya.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
