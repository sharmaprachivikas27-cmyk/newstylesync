import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-soft">
        <Sparkles className="w-8 h-8 text-coral-500" />
      </div>
      <h1 className="font-display font-black text-6xl sm:text-7xl text-slate-900 dark:text-white mb-2">
        404
      </h1>
      <h2 className="font-display font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">
        Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-8">
        The boutique look or destination you were searching for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-2 shadow-soft hover:shadow-glow transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Storefront</span>
      </Link>
    </div>
  );
}
