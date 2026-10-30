import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CreditCard, QrCode, Banknote, ShieldCheck, Check, Save } from 'lucide-react';

export default function PaymentSettingsPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || user?.shop?.id || '');
  const { addToast } = useToast();

  const [methods, setMethods] = useState({
    upi: true,
    card: true,
    cod: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function resolveShop() {
      if (user?.shopId) {
        setShopId(user.shopId);
        return;
      }
      if (user?.shop?.id) {
        setShopId(user.shop.id);
        return;
      }
      if (user?.id) {
        try {
          const myShop = await shopService.getShopByOwnerId(user.id);
          if (myShop) {
            setShopId(myShop.id);
            return;
          }
        } catch (e) {
          console.error('Error resolving shop:', e);
        }
      }
    }
    resolveShop();
  }, [user]);

  useEffect(() => {
    async function loadSettings() {
      if (!shopId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const current = await settingsService.getPaymentSettings(shopId);
        if (current) setMethods(current);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [shopId]);

  const handleToggle = (key) => {
    setMethods(prev => {
      // Ensure at least one payment method stays enabled
      const enabledCount = Object.values({ ...prev, [key]: !prev[key] }).filter(Boolean).length;
      if (enabledCount === 0) {
        addToast({
          type: 'warning',
          message: 'At least one payment method must remain active for customer checkout.'
        });
        return prev;
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updatePaymentSettings(shopId, methods);
      addToast({
        type: 'success',
        title: 'Payment Settings Saved',
        message: 'Your boutique checkout payment methods have been updated.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to save payment settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Financial Gateways
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Payment Options Setup
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Toggle which payment methods customers can select during checkout for your boutique
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 space-y-6">
          
          {/* UPI Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-coral-50 dark:bg-coral-950/60 text-coral-500">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  UPI Payments & QR
                </h4>
                <p className="text-xs text-slate-500">
                  Accept instant Google Pay, PhonePe, and BHIM QR settlements
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={methods.upi}
                onChange={() => handleToggle('upi')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {/* Card Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Credit & Debit Cards
                </h4>
                <p className="text-xs text-slate-500">
                  Accept international Visa, Mastercard, American Express
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={methods.card}
                onChange={() => handleToggle('card')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {/* Cash on Delivery Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Cash on Delivery (COD)
                </h4>
                <p className="text-xs text-slate-500">
                  Customers pay courier cash or UPI at home delivery
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={methods.cod}
                onChange={() => handleToggle('cod')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/50 dark:border-brand-900/30 text-xs text-brand-800 dark:text-brand-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p>
              When a payment method is toggled off here, it will be automatically hidden from customer selection on the checkout page for this boutique.
            </p>
          </div>

        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Payment Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
