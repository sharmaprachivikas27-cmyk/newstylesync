import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, role, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mb-4 border border-amber-200 dark:border-amber-900/50 shadow-soft">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white mb-2">
          Access Restricted
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          This portal requires a <strong>{allowedRoles.join(' or ')}</strong> account. You are currently signed in as <strong>{role}</strong> ({user.name || user.email}).
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-all border border-rose-200 dark:border-rose-900/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
