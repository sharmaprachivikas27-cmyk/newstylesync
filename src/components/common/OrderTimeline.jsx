import React from 'react';
import { Check, Clock, PackageCheck, Truck, Gift, XCircle, RotateCcw } from 'lucide-react';

const STANDARD_STEPS = [
  { key: 'Placed', label: 'Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: Check },
  { key: 'Packed', label: 'Packed', icon: PackageCheck },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Gift },
];

export default function OrderTimeline({ status, timeline = [] }) {
  const isCancelled = status === 'Cancelled';
  const isReturned = status === 'Returned';

  // Find index in standard steps
  const currentStepIndex = STANDARD_STEPS.findIndex(
    s => s.key.toLowerCase() === (status || '').toLowerCase()
  );

  return (
    <div className="w-full py-4">
      {/* Special banner if cancelled or returned */}
      {isCancelled && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <div>
            <h5 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Order Cancelled</h5>
            <p className="text-xs text-rose-700 dark:text-rose-400">This order has been cancelled and any paid balance is refunded.</p>
          </div>
        </div>
      )}

      {isReturned && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
          <RotateCcw className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Order Returned</h5>
            <p className="text-xs text-amber-700 dark:text-amber-400">The return request has been approved and processed by the boutique.</p>
          </div>
        </div>
      )}

      {/* Visual Step Tracker (Horizontal Bar) */}
      {!isCancelled && !isReturned && (
        <div className="relative mb-8">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              style={{
                width: `${Math.max(12, ((currentStepIndex + 1) / STANDARD_STEPS.length) * 100)}%`
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-brand-600 to-coral-500 transition-all duration-500"
            />
          </div>

          <div className="grid grid-cols-5 text-center">
            {STANDARD_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110 shadow-soft'
                        : isCompleted
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium tracking-tight ${
                      isCurrent
                        ? 'text-brand-600 dark:text-brand-400 font-bold'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chronological Event History */}
      {timeline && timeline.length > 0 && (
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Lifecycle Events
          </h4>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {timeline.slice().reverse().map((event, i) => (
              <div key={i} className="relative group">
                <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-900" />
                <div className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {event.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
