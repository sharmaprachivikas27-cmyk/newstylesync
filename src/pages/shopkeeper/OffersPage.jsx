import React, { useState, useEffect } from 'react';
import { couponService } from '../../services/couponService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { Tag, Plus, Trash2, Calendar, DollarSign, Percent, Check } from 'lucide-react';

export default function OffersPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || user?.shop?.id || '');
  const { addToast } = useToast();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage', // 'percentage' | 'flat'
    value: 15,
    minOrder: 80,
    maxDiscount: 45,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

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

  const loadOffers = async () => {
    try {
      setLoading(true);
      const list = await couponService.getOffers({ shopId: shopId || 'all' });
      setOffers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [shopId]);

  const handleDelete = async (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      await couponService.deleteOffer(id);
      addToast({ type: 'info', message: `Coupon "${code}" removed.` });
      await loadOffers();
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.value) {
      addToast({ type: 'warning', message: 'Please provide valid coupon code and discount value.' });
      return;
    }

    try {
      setSaving(true);
      await couponService.createOffer({
        ...formData,
        shopId
      });
      addToast({
        type: 'success',
        title: 'Promotion Created',
        message: `Coupon code "${formData.code.toUpperCase()}" is now live!`
      });
      setAddModalOpen(false);
      setFormData({
        code: '',
        description: '',
        type: 'percentage',
        value: 15,
        minOrder: 80,
        maxDiscount: 45,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
      });
      await loadOffers();
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to create coupon.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Marketing & Incentives
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Offers & Discount Coupons
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure percentage or flat promotions, minimum order values, and validity expiry dates
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-base text-slate-900 dark:text-white tracking-wide">
                      {offer.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-coral-100 dark:bg-coral-950 text-coral-600 dark:text-coral-400">
                      {offer.type === 'percentage' ? `${offer.value}% OFF` : `$${offer.value} FLAT OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {offer.description || `Save ${offer.type === 'percentage' ? `${offer.value}%` : `$${offer.value}`} on qualifying orders.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Min. Order: <strong>${offer.minOrder}</strong></span>
                    {offer.maxDiscount && (
                      <span>Max Cap: <strong>${offer.maxDiscount}</strong></span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(offer.id, offer.code)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          No promotional coupons currently active.
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create Discount Coupon">
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FLASH25"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Discount Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder={formData.type === 'percentage' ? 'e.g. 20 (%)' : 'e.g. 40 ($)'}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Min Order Amount ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Short Description / Terms
            </label>
            <input
              type="text"
              placeholder="e.g. 20% off all trench coats and knits"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Creating...' : 'Activate Coupon'}</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
