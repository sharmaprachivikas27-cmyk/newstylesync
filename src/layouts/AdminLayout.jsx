import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AddShopModal from '../components/admin/AddShopModal';
import ToastContainer from '../components/common/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, ShieldCheck, Sparkles, LogOut, Plus } from 'lucide-react';

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [addShopModalOpen, setAddShopModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-coral-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight hidden sm:inline">
                Style<span className="text-brand-600 dark:text-brand-400">Sync</span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Add Shop button in header */}
            <button
              onClick={() => setAddShopModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-soft transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shop</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.name || user?.email?.split('@')[0] || 'System Administrator'}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight">
                  Super Admin
                </p>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenAddShop={() => setAddShopModalOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet context={{ openAddShopModal: () => setAddShopModalOpen(true) }} />
        </main>
      </div>

      <AddShopModal
        isOpen={addShopModalOpen}
        onClose={() => setAddShopModalOpen(false)}
        onShopAdded={() => {
          // Trigger a window event so list pages re-fetch
          window.dispatchEvent(new CustomEvent('shop-created'));
        }}
      />

      <ToastContainer />
    </div>
  );
}
