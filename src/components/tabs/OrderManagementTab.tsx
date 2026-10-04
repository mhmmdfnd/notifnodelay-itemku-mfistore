import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { TokokuOrder, RefundReason } from '../../types';
import { formatRupiah, formatRequiredInfo } from '../../utils/constants';

interface OrderManagementTabProps {
  orders: TokokuOrder[];
  onDeliverOrder: (orderId: number, deliveryInfo?: any) => Promise<boolean>;
  onRejectOrder: (orderId: number, refundReason: RefundReason) => Promise<boolean>;
  onSimulateOrder: () => void;
}

export const OrderManagementTab: React.FC<OrderManagementTabProps> = ({
  orders,
  onDeliverOrder,
  onRejectOrder,
  onSimulateOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TokokuOrder | null>(null);
  const [actionType, setActionType] = useState<'DELIVER' | 'REJECT'>('DELIVER');
  const [voucherInput, setVoucherInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rejectReason, setRejectReason] = useState<RefundReason>('NO_STOCK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute metrics as shown in user screenshot
  const totalOrders = orders.length;
  const requireProcessOrders = orders.filter(o => o.status === 'REQUIRE_PROCESS');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalNetProfit = orders.reduce((sum, o) => sum + (o.order_income || 0), 0);

  // Filter orders by search
  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const orderNum = o.order_number.toLowerCase();
    const buyer = o.buyer_name.toLowerCase();
    const prod = o.product_name.toLowerCase();
    const game = o.game_name.toLowerCase();
    const reqInfo = JSON.stringify(o.required_information).toLowerCase();
    return orderNum.includes(q) || buyer.includes(q) || prod.includes(q) || game.includes(q) || reqInfo.includes(q);
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenActionModal = (order: TokokuOrder, type: 'DELIVER' | 'REJECT' = 'DELIVER') => {
    setSelectedOrder(order);
    setActionType(type);
    setActionMessage(null);
    setVoucherInput('');
    setEmailInput('');
    setPasswordInput('');
  };

  const handleExecuteAction = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    setActionMessage(null);

    let ok = false;
    if (actionType === 'DELIVER') {
      let deliveryInfo: any = null;
      if (selectedOrder.using_delivery_info) {
        if (selectedOrder.delivery_info_field) {
          deliveryInfo = [{ Email: emailInput, Password: passwordInput }];
        } else {
          deliveryInfo = voucherInput.split('\n').filter(Boolean);
        }
      }
      ok = await onDeliverOrder(selectedOrder.order_id, deliveryInfo);
      if (ok) {
        setActionMessage('Pesanan berhasil dikirim (DELIVERED) ke pembeli via Tokoku API!');
        setTimeout(() => setSelectedOrder(null), 1200);
      }
    } else {
      ok = await onRejectOrder(selectedOrder.order_id, rejectReason);
      if (ok) {
        setActionMessage(`Pesanan berhasil ditolak (REJECTED) dengan alasan ${rejectReason}.`);
        setTimeout(() => setSelectedOrder(null), 1200);
      }
    }
    setIsSubmitting(false);
  };

  const refundReasonsList: { code: RefundReason; desc: string }[] = [
    { code: 'NO_STOCK', desc: 'Stok Habis (Product has no stock)' },
    { code: 'WRONG_BUYER_INFORMATION', desc: 'Informasi Pembeli Salah / Tidak Lengkap' },
    { code: 'PRICE_CHANGED', desc: 'Harga Produk Berubah (Price changed)' },
    { code: 'BUYER_UNREACHABLE', desc: 'Pembeli Tidak Bisa Dihubungi' },
    { code: 'BUYER_DOES_NOT_UNDESTAND_TRADING', desc: 'Pembeli Belum Memahami Cara Trading' },
    { code: 'WRONG_VERIFICATION_CODE', desc: 'Kode Verifikasi Salah' },
    { code: 'JOKI_QUEUE_FULL', desc: 'Antrian Joki Penuh' },
    { code: 'SERVER_ERROR', desc: 'Gangguan Server Game' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 4 Top Metric Cards (Exact match to User Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: TOTAL PESANAN API */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800/90 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL PESANAN API
          </p>
          <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            {totalOrders}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Real-time Tokoku Webhook
          </p>
        </div>

        {/* Card 2: PERLU DIPROSES (REQUIRE_PROCESS) */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800/90 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            PERLU DIPROSES (REQUIRE_PROCESS)
          </p>
          <div className="mt-2 text-3xl font-extrabold text-[#eab308] tracking-tight">
            {requireProcessOrders.length}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Action: /api/order/action
          </p>
        </div>

        {/* Card 3: SELESAI (DELIVERED) */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800/90 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            SELESAI (DELIVERED)
          </p>
          <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            {deliveredOrders.length}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            100% Sukses Otomatis
          </p>
        </div>

        {/* Card 4: ESTIMASI PROFIT BERSIH */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800/90 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            ESTIMASI PROFIT BERSIH
          </p>
          <div className="mt-2 text-2xl lg:text-3xl font-extrabold text-[#c084fc] tracking-tight">
            {formatRupiah(totalNetProfit)}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Kalkulasi Margin Akurat
          </p>
        </div>

      </div>

      {/* Main Table Card (Daftar Transaksi Tokoku API) */}
      <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800/90 shadow-lg space-y-4">
        
        {/* Table Header & Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Daftar Transaksi Tokoku API
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sinkronisasi instan pesanan pembeli dengan dukungan format required_information lengkap.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Order / Pembeli..."
                className="w-full pl-9 pr-3.5 py-2 bg-[#080d17] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* Sandbox Generator Button */}
            <button
              onClick={onSimulateOrder}
              title="Simulasikan Order Masuk via Tokoku Sandbox API"
              className="px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Simulasi Order (Sandbox)</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#090e1a] text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3.5 px-4">NO. ORDER / ID</th>
                <th className="py-3.5 px-4">PEMBELI &amp; PRODUK</th>
                <th className="py-3.5 px-4">REQUIRED INFO (PLAYER / ZONE / EMAIL)</th>
                <th className="py-3.5 px-4">PENDAPATAN / HARGA</th>
                <th className="py-3.5 px-4">STATUS ITEMKU</th>
                <th className="py-3.5 px-4 text-right">AKSI API</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada pesanan yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isRequireProcess = order.status === 'REQUIRE_PROCESS';
                  const isDelivered = order.status === 'DELIVERED';

                  return (
                    <tr 
                      key={order.order_id}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      {/* NO. ORDER / ID */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{order.order_number}</span>
                          <button
                            onClick={() => handleCopy(order.order_number, `${order.order_id}`)}
                            title="Salin No. Order"
                            className="text-slate-500 hover:text-slate-300 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedId === `${order.order_id}` && (
                            <span className="text-[10px] text-teal-400 font-sans">Salin!</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ID: {order.order_id}
                        </div>
                      </td>

                      {/* PEMBELI & PRODUK */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-semibold text-white">
                          {order.buyer_name}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {order.product_name}
                        </div>
                      </td>

                      {/* REQUIRED INFO (PLAYER / ZONE / EMAIL) */}
                      <td className="py-4 px-4 align-middle font-mono text-[11px] text-slate-300">
                        {formatRequiredInfo(order.required_information)}
                      </td>

                      {/* PENDAPATAN / HARGA */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-bold text-white">
                          {formatRupiah(order.price)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Income: {formatRupiah(order.order_income)}
                        </div>
                      </td>

                      {/* STATUS ITEMKU */}
                      <td className="py-4 px-4 align-middle">
                        {isRequireProcess ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#2a220b] text-[#facc15] border border-[#ca8a04]/40 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] animate-pulse"></span>
                            • REQUIRE_PROCESS
                          </span>
                        ) : isDelivered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0c281e] text-[#34d399] border border-[#059669]/40 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
                            • DELIVERED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-red-950/60 text-red-400 border border-red-800/40 font-mono">
                            • REFUNDED
                          </span>
                        )}
                      </td>

                      {/* AKSI API */}
                      <td className="py-4 px-4 align-middle text-right">
                        {isRequireProcess ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenActionModal(order, 'DELIVER')}
                              className="px-3.5 py-1.5 rounded-full bg-[#059669] hover:bg-[#10b981] text-white font-semibold text-xs transition shadow-sm shadow-emerald-700/30 flex items-center gap-1.5"
                            >
                              <span>Kirim (DELIVER)</span>
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(order, 'REJECT')}
                              title="Tolak Pesanan (REJECT)"
                              className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Order Action Modal (Deliver / Reject with Tokoku API fields) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e1626] border border-slate-800 shadow-2xl p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                  Tokoku API: /api/order/action
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">
                  {actionType === 'DELIVER' ? 'Kirim Pesanan (DELIVER)' : 'Tolak Pesanan (REJECT)'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedOrder.order_number} • ID: {selectedOrder.order_id}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Brief Info */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Pembeli:</span>
                <span className="font-semibold text-white">{selectedOrder.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Produk:</span>
                <span className="font-semibold text-slate-200">{selectedOrder.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required Info:</span>
                <span className="font-mono text-teal-300">{formatRequiredInfo(selectedOrder.required_information)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Total Transaksi:</span>
                <span className="font-bold text-emerald-400 font-mono">{formatRupiah(selectedOrder.price)}</span>
              </div>
            </div>

            {/* Action Switch Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActionType('DELIVER')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  actionType === 'DELIVER' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kirim (DELIVER)
              </button>
              <button
                type="button"
                onClick={() => setActionType('REJECT')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  actionType === 'REJECT' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tolak (REJECT)
              </button>
            </div>

            {/* If DELIVER */}
            {actionType === 'DELIVER' && (
              <div className="space-y-3 text-xs">
                {selectedOrder.using_delivery_info ? (
                  selectedOrder.delivery_info_field ? (
                    <div className="space-y-2">
                      <p className="text-slate-300 font-medium">
                        Masukkan Data Akun untuk Pembeli:
                      </p>
                      <input
                        type="text"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Username / Email Akun"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Password Akun"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">
                        Kode Voucher (1 baris per kode):
                      </label>
                      <textarea
                        rows={3}
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        placeholder="Contoh: X12345-ABCD-6789"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )
                ) : (
                  <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/60 text-teal-300 text-xs">
                    💡 <strong>Direct Top-up:</strong> Produk ini berjenis direct injection (Top Up). Itemku tidak mewajibkan delivery_info. Klik konfirmasi untuk menyelesaikan pesanan.
                  </div>
                )}
              </div>
            )}

            {/* If REJECT */}
            {actionType === 'REJECT' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-300 font-medium">
                  Pilih Alasan Pembatalan (refund_reason):
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value as RefundReason)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {refundReasonsList.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} — {r.desc}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Dana akan dikembalikan otomatis oleh sistem Itemku ke saldo pembeli.
                </p>
              </div>
            )}

            {/* Action Feedback */}
            {actionMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 flex items-center gap-2 ${
                  actionType === 'DELIVER' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20' 
                    : 'bg-red-600 hover:bg-red-500 shadow-md shadow-red-700/20'
                }`}
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{actionType === 'DELIVER' ? 'Kirim via Tokoku API' : 'Tolak & Kembalikan Dana'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
