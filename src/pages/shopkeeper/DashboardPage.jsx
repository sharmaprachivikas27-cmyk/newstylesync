import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../../services/shopService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/shopkeeper/StatsCard';
import InventoryChart from '../../components/shopkeeper/InventoryChart';
import { StatsSkeletonGrid } from '../../components/common/LoadingSkeleton';
import {
  Package,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  DollarSign,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Store,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || '');
  const [currentShop, setCurrentShop] = useState(user?.shop || null);

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load shop owned by current user
  useEffect(() => {
    async function initShop() {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Find boutique owned by this shopkeeper
        let shop = await shopService.getShopByOwnerId(user.id);
        if (!shop && user.shopId) {
          shop = await shopService.getShopById(user.shopId);
        }

        if (shop) {
          setShopId(shop.id);
          setCurrentShop(shop);

          const [statsData, ordersData] = await Promise.all([
            shopService.getShopStats(shop.id),
            orderService.getOrders({ shopId: shop.id })
          ]);
          setStats(statsData);
          setRecentOrders(ordersData.slice(0, 5));
        } else {
          setStats({
            totalProducts: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inStockCount: 0,
            totalOrders: 0,
            ordersToday: 0,
            revenue: 0,
            pendingReturns: 0
          });
          setRecentOrders([]);
        }
      } catch (e) {
        console.error('Shopkeeper dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    initShop();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <StatsSkeletonGrid />
      </div>
    );
  }

  if (!currentShop && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-900/50">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white mb-2">
          No Boutique Registered Yet
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          Welcome, {user?.name || 'Shopkeeper'}! Your shopkeeper account is active, but we haven't found a boutique linked to your profile in Supabase.
        </p>
        <Link
          to="/signup"
          className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Your Boutique</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Shopkeeper Management Center
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            {currentShop?.name} Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time inventory metrics, order fulfillment, and boutique performance from Supabase
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/products?shopId=${shopId}&shopName=${encodeURIComponent(currentShop?.name || 'Boutique')}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Open customer view for your shop"
          >
            <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Storefront View</span>
          </Link>

          <Link
            to="/shopkeeper/products/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Garment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Catalog Garments"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          color="indigo"
          badgeText="Active SKUs"
        />
        <StatsCard
          title="Low Stock Alert (≤5)"
          value={stats?.lowStockCount ?? 0}
          icon={AlertTriangle}
          color="amber"
          badgeText="Restock Soon"
        />
        <StatsCard
          title="Out of Stock"
          value={stats?.outOfStockCount ?? 0}
          icon={XCircle}
          color="rose"
          badgeText="Unavailable"
        />
        <StatsCard
          title="Shop Gross Revenue"
          value={`$${(stats?.revenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          badgeText="Fulfillment"
        />
      </div>

      {/* Second Row: Inventory Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Inventory Status Breakdown */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Inventory Health Distribution
              </h3>
              <p className="text-xs text-slate-500">Live garment availability for {currentShop?.name}</p>
            </div>
            <Link
              to="/shopkeeper/inventory"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <InventoryChart
            inStock={stats?.inStockCount || 0}
            lowStock={stats?.lowStockCount || 0}
            outOfStock={stats?.outOfStockCount || 0}
          />
        </div>

        {/* Boutique Details & Direct Shortcuts */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Boutique Profile
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={currentShop?.logo_url || currentShop?.logo || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80'}
                alt={currentShop?.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {currentShop?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentShop?.address || 'Fashion District'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
              {currentShop?.description || 'Exclusive fashion boutique on StyleSync.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link
              to="/shopkeeper/products/new"
              className="w-full py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold text-xs flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-500" />
                Upload New Product
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/shopkeeper/orders"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-semibold text-xs flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                View Customer Orders
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Shop Orders */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Recent Orders for {currentShop?.name}
            </h3>
            <p className="text-xs text-slate-500">Live orders placed by customers in your boutique</p>
          </div>
          <Link
            to="/shopkeeper/orders"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No orders placed for this boutique yet. New customer orders will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Placed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {o.id}
                    </td>
                    <td className="py-3 px-4">
                      {o.customerName || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {o.items?.length || 0} item(s)
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${o.total}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
