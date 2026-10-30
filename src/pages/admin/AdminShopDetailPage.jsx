import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import StatsCard from '../../components/shopkeeper/StatsCard';
import {
  DEFAULT_SHOP_LOGO,
  DEFAULT_SHOP_BANNER,
  DEFAULT_PRODUCT_IMAGE
} from '../../services/uploadService';
import {
  ChevronLeft,
  Store,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Package,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  ExternalLink
} from 'lucide-react';

export default function AdminShopDetailPage() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      const [shopData, statsData, prodsData, ordersData] = await Promise.all([
        shopService.getShopById(id),
        shopService.getShopStats(id),
        productService.getProducts({ shopId: id }),
        orderService.getOrders({ shopId: id })
      ]);

      setShop(shopData);
      setStats(statsData);
      setProducts(prodsData);
      setOrders(ordersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopDetails();
  }, [id]);

  const handleToggleShopStatus = async () => {
    if (!shop) return;
    try {
      const updated = await shopService.toggleShopStatus(shop.id, !shop.enabled);
      setShop(updated);
      addToast({
        type: updated.enabled ? 'success' : 'info',
        message: `${shop.name} is now ${updated.enabled ? 'Enabled' : 'Disabled'}.`
      });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to update shop status.' });
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
        Loading boutique dossier...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Boutique Not Found</h2>
        <Link to="/admin/shops" className="text-sm font-semibold text-brand-600 hover:underline">
          Return to Shops Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/shops"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Boutique Dossier
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {shop.name}
          </h1>
        </div>
      </div>

      {/* Hero Banner & Vendor Identity Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        {/* Banner image */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-800">
          <img
            src={shop.banner || shop.banner_url || DEFAULT_SHOP_BANNER}
            alt=""
            onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_BANNER; }}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent" />
        </div>

        {/* Identity Details */}
        <div className="p-6 relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <img
              src={shop.logo || shop.logo_url || DEFAULT_SHOP_LOGO}
              alt={shop.name}
              onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_LOGO; }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-white"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                  {shop.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                  {shop.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                {shop.description}
              </p>
            </div>
          </div>

          {/* Toggle Enable/Disable Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleShopStatus}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-soft transition-all ${
                shop.enabled
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {shop.enabled ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Disable Boutique</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enable Boutique</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Vendor Contact Information Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Owner / Shopkeeper</span>
            <p className="font-bold text-slate-900 dark:text-white">{shop.ownerName}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Email Address</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{shop.email}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</span>
            <p className="font-medium text-slate-700 dark:text-slate-300">{shop.phone}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Atelier Address</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 truncate">
              {shop.address}, {shop.city}, {shop.state} {shop.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* Stock & Business Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Catalog styles"
            icon={Package}
            color="brand"
          />
          <StatsCard
            title="Low Stock"
            value={stats.lowStockCount}
            subtitle="Under 5 units"
            icon={AlertTriangle}
            color="amber"
          />
          <StatsCard
            title="Out of Stock"
            value={stats.outOfStockCount}
            subtitle="0 stock available"
            icon={XCircle}
            color="rose"
          />
          <StatsCard
            title="Orders Count"
            value={stats.totalOrders}
            subtitle="Purchased items"
            icon={ShoppingBag}
            color="coral"
          />
          <StatsCard
            title="Boutique Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            subtitle="Net realized volume"
            icon={DollarSign}
            color="emerald"
          />
        </div>
      )}

      {/* Tabbed Products & Orders section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 space-y-6">
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-3 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'products'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Catalog Garments ({products.length})
            {activeTab === 'products' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'orders'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Boutique Orders ({orders.length})
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Garment</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock Available</th>
                  <th className="py-3 px-3">Sizes</th>
                  <th className="py-3 px-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || p.image_urls?.[0] || DEFAULT_PRODUCT_IMAGE}
                          alt=""
                          onError={(e) => { e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                          className="w-9 h-11 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${p.price}</td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${p.stock <= 5 ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{p.sizes?.join(', ')}</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/products/${p.id}`}
                        target="_blank"
                        className="p-1 text-slate-400 hover:text-brand-600 inline-block"
                        title="View on storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Placed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{o.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{o.customerName}</p>
                      <p className="text-[10px] text-slate-400">{o.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{o.items.length} garments</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${o.total}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
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
