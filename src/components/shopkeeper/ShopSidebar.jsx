import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  RotateCcw,
  Tag,
  MessageSquare,
  CreditCard,
  Store,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function ShopSidebar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/shopkeeper', icon: LayoutDashboard, end: true },
    { name: 'Product Catalog', path: '/shopkeeper/inventory', icon: Package },
    { name: 'Add Product', path: '/shopkeeper/products/new', icon: PlusCircle },
    { name: 'Customer Orders', path: '/shopkeeper/orders', icon: ShoppingBag },
    { name: 'Return/Cancel Requests', path: '/shopkeeper/returns', icon: RotateCcw, badge: true },
    { name: 'Coupons & Offers', path: '/shopkeeper/offers', icon: Tag },
    { name: 'Customer Reviews', path: '/shopkeeper/feedback', icon: MessageSquare },
    { name: 'Payment Setup', path: '/shopkeeper/payments', icon: CreditCard },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-sm">
      {/* Shop Identity Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-coral-500 text-white flex items-center justify-center font-bold shadow-soft">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
              {user?.shopName || 'Aura Studio & Co.'}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Boutique
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
      </nav>

      {/* Footer link to public storefront */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span>View Customer Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-64px)] sticky top-16 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
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
