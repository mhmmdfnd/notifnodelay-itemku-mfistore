import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Gamepad2,
  PieChart,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { TokokuOrder } from '../../types';
import { formatRupiah } from '../../utils/constants';

interface ProfitAnalysisTabProps {
  orders: TokokuOrder[];
}

export const ProfitAnalysisTab: React.FC<ProfitAnalysisTabProps> = ({ orders }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const grossSales = orders.reduce((sum, o) => sum + o.price, 0);
  const netIncome = orders.reduce((sum, o) => sum + o.order_income, 0);
  const totalAdsFee = orders.reduce((sum, o) => sum + (o.ads_fee || 0), 0);
  const totalItemkuFee = grossSales - netIncome - totalAdsFee;
  const marginPercent = grossSales > 0 ? ((netIncome / grossSales) * 100).toFixed(1) : '0';

  // Group by game
  const gameStats = orders.reduce((acc, order) => {
    const game = order.game_name || 'Lainnya';
    if (!acc[game]) {
      acc[game] = { count: 0, revenue: 0, income: 0 };
    }
    acc[game].count += 1;
    acc[game].revenue += order.price;
    acc[game].income += order.order_income;
    return acc;
  }, {} as Record<string, { count: number; revenue: number; income: number }>);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d1424] border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Analisis Keuntungan &amp; Margin Tokoku
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan kalkulasi margin bersih, potongan fee platform Itemku, dan efisiensi iklan lapak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'today' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'week' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'month' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulan Ini
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Omset Kotor */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Omset Kotor</span>
          <div className="text-2xl font-extrabold text-white">
            {formatRupiah(grossSales)}
          </div>
          <p className="text-[11px] text-teal-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {orders.length} Transaksi Terverifikasi
          </p>
        </div>

        {/* Profit Bersih */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Profit Bersih (Income)</span>
          <div className="text-2xl font-extrabold text-[#c084fc]">
            {formatRupiah(netIncome)}
          </div>
          <p className="text-[11px] text-slate-400">
            Diterima langsung ke saldo toko
          </p>
        </div>

        {/* Potongan Platform Fee */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Fee Itemku &amp; Escrow</span>
          <div className="text-2xl font-extrabold text-amber-400">
            {formatRupiah(totalItemkuFee > 0 ? totalItemkuFee : 0)}
          </div>
          <p className="text-[11px] text-slate-400">
            Biaya layanan escrow penjual
          </p>
        </div>

        {/* Rata-Rata Margin */}
        <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Rata-Rata Margin Bersih</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {marginPercent}%
          </div>
          <p className="text-[11px] text-slate-400">
            Efisiensi penjualan sangat tinggi
          </p>
        </div>

      </div>

      {/* Breakdown by Game Category */}
      <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-400" />
          Distribusi Penjualan Menurut Kategori Game
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(gameStats).map(([game, stat]) => {
            const pct = grossSales > 0 ? Math.round((stat.revenue / grossSales) * 100) : 0;
            return (
              <div key={game} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{game}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-mono">
                    {stat.count} Pesanan
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Omset:</span>
                  <span className="font-bold text-slate-200">{formatRupiah(stat.revenue)}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Net Income:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(stat.income)}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  {pct}% dari total omset
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
