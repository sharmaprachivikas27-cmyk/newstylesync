import React from 'react';

export function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-3 animate-pulse"
        >
          <div className="w-full aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 animate-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
