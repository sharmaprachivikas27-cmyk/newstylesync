import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Zap } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-950/20 dark:via-transparent">
      {/* Glow orb decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-coral-500/10 dark:bg-coral-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 shadow-soft text-brand-700 dark:text-brand-300 text-xs font-semibold animate-fade-in">
              <Sparkles className="w-4 h-4 text-coral-500" />
              <span>Autumn/Winter '26 Smart Capsule</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Sartorial luxury meets{' '}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-coral-500 bg-clip-text text-transparent">
                intelligent commerce.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Curated boutique apparel from verified independent fashion houses. Real-time lifecycle tracking, 24-hour instant cancellation window, and tailored silhouettes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] transition-all"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?category=Outerwear"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 shadow-soft transition-all"
              >
                Explore Outerwear
              </Link>
            </div>

            {/* Platform Feature Trust Badges */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-100/70 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">24h Window</p>
                  <p className="text-[11px] text-slate-500">Instant cancel request</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-coral-100/70 dark:bg-coral-950 text-coral-600 dark:text-coral-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Live Tracking</p>
                  <p className="text-[11px] text-slate-500">Visual order stages</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100/70 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Multi-Shop</p>
                  <p className="text-[11px] text-slate-500">Direct artisan shops</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Editorial Visuals */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              
              {/* Main Fashion Poster */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                  alt="High fashion editorial model"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider w-max mb-2">
                    Featured Boutique
                  </span>
                  <h3 className="font-display font-bold text-xl">Aura Studio & Co.</h3>
                  <p className="text-xs text-slate-200">New York • Autumn Trench Capsule</p>
                </div>
              </div>

              {/* Floating Accent Card */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg backdrop-blur-md max-w-[210px] hidden sm:block animate-fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=80"
                    alt="Cashmere trench"
                    className="w-12 h-14 object-cover rounded-xl"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-coral-500">Trending</span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">Cashmere Trench</p>
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400">$189</p>
                  </div>
                </div>
              </div>

              {/* Floating Coupon Badge */}
              <div className="absolute -top-4 -right-4 p-3 rounded-2xl bg-gradient-to-br from-brand-600 to-coral-500 text-white shadow-glow hidden sm:block animate-fade-in">
                <p className="text-[10px] uppercase font-extrabold tracking-wider">Use Coupon</p>
                <p className="text-sm font-black font-display tracking-wide">STYLE20</p>
                <p className="text-[9px] text-white/90">20% off over $100</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
