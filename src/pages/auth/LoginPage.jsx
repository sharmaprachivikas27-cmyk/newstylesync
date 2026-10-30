import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      addToast({ type: 'warning', message: 'Please enter your email and password.' });
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login({ email: email.trim(), password });
      const userRole = loggedUser?.role || 'customer';

      addToast({
        type: 'success',
        title: 'Signed In',
        message: `Welcome back, ${loggedUser?.name || email}! Signed in as ${userRole}.`
      });

      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'shopkeeper') {
        navigate('/shopkeeper');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err?.message || 'Invalid email or password.';
      setErrorMessage(msg);
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-coral-500 flex items-center justify-center text-white shadow-soft">
              <Sparkles className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Welcome to StyleSync
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with your registered Supabase credentials to access your account.
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 sm:p-8 space-y-5">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-soft hover:scale-[1.01] transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 space-y-2">
            <p>
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Register as Customer or Shopkeeper
              </Link>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin access is provisioned by setting role to "admin" in profiles.</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
