import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Store,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function AdminSidebar({ mobileOpen, onCloseMobile, onOpenAddShop }) {
  const links = [
    { name: 'Admin Overview', path: '/admin', icon: TrendingUp, end: true },
    { name: 'Manage Shops', path: '/admin/shops', icon: Store },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-sm">
      {/* Admin Identity Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-600 text-white flex items-center justify-center font-bold shadow-soft">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
              Admin Console
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Full System Access
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-soft shadow-brand-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          );
        })}

        {/* Quick Add Shop Action button */}
        {onOpenAddShop && (
          <button
            onClick={() => {
              onCloseMobile?.();
              onOpenAddShop();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Register New Shop</span>
            </div>
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200">+</span>
          </button>
        )}
      </nav>

      {/* Footer link to public storefront */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link
          to="/shopkeeper"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
        >
          <span>Switch to Shopkeeper View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span>Customer Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 h-[calc(100vh-64px)] sticky top-16 shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
