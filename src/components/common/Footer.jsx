import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Clock, RotateCcw, Truck, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Value propositions banner */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24-Hour Easy Cancel</h4>
                <p className="text-xs text-slate-400">Instant returns & cancel within 24 hours</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-coral-500/10 flex items-center justify-center text-coral-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Express Delivery</h4>
                <p className="text-xs text-slate-400">Complimentary on orders over $150</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verified Boutiques</h4>
                <p className="text-xs text-slate-400">100% authentic curated designer wear</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Multi-Role Architecture</h4>
                <p className="text-xs text-slate-400">Admin, Shopkeeper & Customer portals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-coral-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                Style<span className="text-brand-400">Sync</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Elevating personal expression through smart curation, bespoke artisan shops, and real-time order lifecycle tracking.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 font-medium">
                React 18 + Vite
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 font-medium">
                Tailwind CSS
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 font-medium">
                Supabase-Ready
              </span>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/products?category=Women" className="hover:text-white transition-colors">Women's Couture</Link></li>
              <li><Link to="/products?category=Men" className="hover:text-white transition-colors">Men's Tailoring</Link></li>
              <li><Link to="/products?category=Outerwear" className="hover:text-white transition-colors">Trench & Capes</Link></li>
              <li><Link to="/products?category=Streetwear" className="hover:text-white transition-colors">Urban Streetwear</Link></li>
              <li><Link to="/products?category=Accessories" className="hover:text-white transition-colors">Leather & Silk</Link></li>
            </ul>
          </div>

          {/* Quick Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/shopkeeper" className="hover:text-white transition-colors">Shopkeeper Center</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders & 24h Window</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Multi-Role Sign In</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Private Access
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Receive limited release previews and seasonal styling capsules.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to private access!'); }} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-coral-600 hover:from-brand-500 hover:to-coral-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-soft"
              >
                <span>Join The Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StyleSync Technologies Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for Next-Generation Fashion Commerce</p>
        </div>
      </div>
    </footer>
  );
}
