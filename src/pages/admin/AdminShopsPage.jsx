import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { shopService } from '../../services/shopService';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SHOP_LOGO } from '../../services/uploadService';
import {
  Store,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function AdminShopsPage() {
  const { openAddShopModal } = useOutletContext() || {};
  const { addToast } = useToast();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'enabled' | 'disabled'

  const loadShops = async () => {
    try {
      setLoading(true);
      const list = await shopService.getShops({
        search,
        status: statusFilter
      });
      setShops(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    const handleShopCreated = () => loadShops();
    window.addEventListener('shop-created', handleShopCreated);
    return () => window.removeEventListener('shop-created', handleShopCreated);
  }, [search, statusFilter]);

  const handleToggle = async (id, currentEnabled, name) => {
    try {
      const updated = await shopService.toggleShopStatus(id, !currentEnabled);
      addToast({
        type: updated.enabled ? 'success' : 'info',
        message: `${name} is now ${updated.enabled ? 'Enabled' : 'Disabled'}.`
      });
      await loadShops();
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to update shop status.' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Tenant Directory
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Fashion Boutiques
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage merchant permissions, search shopkeepers, and inspect individual vendor stores
          </p>
        </div>

        <button
          onClick={openAddShopModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shop</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by boutique name, owner, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Shops' },
            { id: 'enabled', label: 'Active Only' },
            { id: 'disabled', label: 'Disabled Only' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === st.id
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : shops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:shadow-soft-lg transition-all"
            >
              <div>
                {/* Shop Banner / Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={shop.logo || shop.logo_url || DEFAULT_SHOP_LOGO}
                      alt={shop.name}
                      onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_LOGO; }}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/20 shrink-0"
                    />
                    <div>
                      <Link
                        to={`/admin/shops/${shop.id}`}
                        className="font-display font-extrabold text-base text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
                      >
                        {shop.name}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-1">{shop.description}</p>
                    </div>
                  </div>

                  {/* Enable / Disable Status Button */}
                  <button
                    onClick={() => handleToggle(shop.id, shop.enabled, shop.name)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                      shop.enabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-rose-100 hover:text-rose-800'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                    title={shop.enabled ? 'Click to Disable' : 'Click to Enable'}
                  >
                    {shop.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Shopkeeper contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-3">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Shopkeeper: </strong>
                    {shop.ownerName}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shop.phone}</span>
                  </p>
                  <p className="flex items-center gap-1 truncate sm:col-span-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{shop.email}</span>
                  </p>
                  <p className="flex items-center gap-1 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shop.address ? `${shop.address}, ${shop.city}, ${shop.state} ${shop.pincode}` : `${shop.city}, ${shop.state}`}</span>
                  </p>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Registered: {new Date(shop.createdAt).toLocaleDateString()}
                </span>

                <Link
                  to={`/admin/shops/${shop.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>View Full Details & Metrics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          No boutiques match your search criteria.
        </div>
      )}
    </div>
  );
}
