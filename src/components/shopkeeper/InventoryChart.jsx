import React from 'react';
import { BarChart3, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function InventoryChart({ inStockCount = 0, lowStockCount = 0, outOfStockCount = 0 }) {
  const total = inStockCount + lowStockCount + outOfStockCount || 1;
  const inStockPct = Math.round((inStockCount / total) * 100);
  const lowStockPct = Math.round((lowStockCount / total) * 100);
  const outOfStockPct = Math.round((outOfStockCount / total) * 100);

  // Simulated 7-day sales activity bars
  const weeklySales = [
    { day: 'Mon', count: 4, revenue: 420 },
    { day: 'Tue', count: 7, revenue: 780 },
    { day: 'Wed', count: 5, revenue: 530 },
    { day: 'Thu', count: 9, revenue: 990 },
    { day: 'Fri', count: 12, revenue: 1450 },
    { day: 'Sat', count: 16, revenue: 1920 },
    { day: 'Sun', count: 11, revenue: 1310 },
  ];
  const maxRevenue = Math.max(...weeklySales.map(s => s.revenue));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 7-Day Performance Bar Chart */}
      <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Weekly Orders & Revenue</span>
            </h4>
            <p className="text-xs text-slate-500">Live 7-day rolling performance breakdown</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            +18.4% vs last week
          </span>
        </div>

        {/* Visual Bars */}
        <div className="flex items-end justify-between h-44 gap-2 pt-4">
          {weeklySales.map((item) => {
            const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap mb-1">
                  ${item.revenue}
                </div>
                
                {/* Bar */}
                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-brand-600 to-coral-500 group-hover:from-brand-500 group-hover:to-coral-400 rounded-xl transition-all duration-300"
                  />
                </div>

                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Health & Distribution Breakdown */}
      <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft flex flex-col justify-between">
        <div>
          <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
            Inventory Health Overview
          </h4>
          <p className="text-xs text-slate-500 mb-6">Stock level distribution across active catalog</p>

          {/* Segmented Progress Bar */}
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-6">
            <div
              style={{ width: `${inStockPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`In Stock: ${inStockCount} (${inStockPct}%)`}
            />
            <div
              style={{ width: `${lowStockPct}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Low Stock: ${lowStockCount} (${lowStockPct}%)`}
            />
            <div
              style={{ width: `${outOfStockPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Out of Stock: ${outOfStockCount} (${outOfStockPct}%)`}
            />
          </div>

          {/* Legend Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Healthy Stock (&gt;5)</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{inStockCount} items</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Low Stock Alert (1-5)</span>
              </div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">{lowStockCount} items</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Out of Stock (0)</span>
              </div>
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200">{outOfStockCount} items</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 text-center">
          Automated alerts trigger when product inventory drops below 5 units.
        </p>
      </div>

    </div>
  );
}
