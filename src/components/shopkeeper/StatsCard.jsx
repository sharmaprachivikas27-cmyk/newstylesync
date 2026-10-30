import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'brand', change }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border-brand-200 dark:border-brand-800',
    coral: 'bg-coral-50 text-coral-600 dark:bg-coral-950/60 dark:text-coral-400 border-coral-200 dark:border-coral-800',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl border ${colorMap[color] || colorMap.brand}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            {value}
          </h3>
          {change && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {change}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
