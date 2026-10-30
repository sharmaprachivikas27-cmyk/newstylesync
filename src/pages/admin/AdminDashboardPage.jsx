import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import StatsCard from '../../components/shopkeeper/StatsCard';
import { StatsSkeletonGrid } from '../../components/common/LoadingSkeleton';
import {
  Store,
  CheckCircle2,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { openAddShopModal } = useOutletContext() || {};
  const [shops, setShops] = useState([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsList, prodsList, ordersList] = await Promise.all([
        shopService.getShops(),
        productService.getProducts(),
        orderService.getOrders()
      ]);
      setShops(shopsList);
      setTotalProductsCount(prodsList.length);
      setTotalOrdersCount(ordersList.length);
      const rev = ordersList
        .filter(o => o.status !== 'Cancelled' && o.status !== 'Returned')
        .reduce((sum, o) => sum + (o.total || 0), 0);
      setPlatformRevenue(rev);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleShopCreated = () => loadData();
    window.addEventListener('shop-created', handleShopCreated);
    return () => window.removeEventListener('shop-created', handleShopCreated);
  }, []);

  const handleToggleShopStatus = async (id, currentStatus) => {
    try {
      await shopService.toggleShopStatus(id, !currentStatus);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const activeShopsCount = shops.filter(s => s.enabled).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Platform Master Console
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            System Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee multi-shop merchant tenancies, enable/disable vendors, and inspect network GMV
          </p>
        </div>

        <button
          onClick={openAddShopModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Shop</span>
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <StatsSkeletonGrid count={5} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Shops"
            value={shops.length}
            subtitle={`${activeShopsCount} active vendors`}
            icon={Store}
            color="brand"
          />
          <StatsCard
            title="Active Shops"
            value={activeShopsCount}
            subtitle={`${shops.length - activeShopsCount} suspended`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Live Garments"
            value={totalProductsCount}
            subtitle="Platform-wide styles"
            icon={Package}
            color="amber"
          />
          <StatsCard
            title="Platform Orders"
            value={totalOrdersCount}
            subtitle="Processed orders"
            icon={ShoppingBag}
            color="coral"
          />
          <StatsCard
            title="Gross GMV"
            value={`$${platformRevenue.toLocaleString()}`}
            subtitle="Lifetime settled volume"
            icon={DollarSign}
            color="emerald"
          />
        </div>
      )}

      {/* Shops Overview Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Registered Fashion Boutiques
            </h3>
            <p className="text-xs text-slate-500">Click a boutique row to inspect vendor metrics</p>
          </div>
          <Link
            to="/admin/shops"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Boutiques</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Boutique</th>
                <th className="py-3 px-3">Shopkeeper</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <Link
                      to={`/admin/shops/${shop.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={shop.logo}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {shop.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{shop.id}</p>
                      </div>
                    </Link>
                  </td>

                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{shop.ownerName}</p>
                    <p className="text-[10px] text-slate-400">{shop.email}</p>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {shop.phone}
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {shop.city}, {shop.state}
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleShopStatus(shop.id, shop.enabled)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        shop.enabled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-rose-100 hover:text-rose-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                      title={shop.enabled ? 'Click to Disable' : 'Click to Enable'}
                    >
                      {shop.enabled ? 'Active / Enabled' : 'Disabled'}
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/admin/shops/${shop.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors"
                    >
                      Inspect Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
