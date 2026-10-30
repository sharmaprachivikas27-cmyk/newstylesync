import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Store,
  Eye,
  Sparkles
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80';

export default function InventoryPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [currentShop, setCurrentShop] = useState(user?.shop || null);
  const [shopId, setShopId] = useState(user?.shopId || '');
  const [availableShops, setAvailableShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Load shop details
  useEffect(() => {
    async function initShop() {
      if (!user?.id) return;
      let shop = await shopService.getShopByOwnerId(user.id);
      if (!shop && user.shopId) {
        shop = await shopService.getShopById(user.shopId);
      }
      if (shop) {
        setShopId(shop.id);
        setCurrentShop(shop);
        setAvailableShops([shop]);
      } else if (user.role === 'admin') {
        const allShops = await shopService.getShops();
        setAvailableShops(allShops);
        if (allShops.length > 0 && !shopId) {
          setShopId(allShops[0].id);
          setCurrentShop(allShops[0]);
        }
      }
    }
    initShop();
  }, [user]);

  const loadProducts = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const items = await productService.getProducts({
        shopId,
        search,
        category: categoryFilter
      });
      setProducts(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [shopId, search, categoryFilter]);

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your boutique catalog?`)) {
      try {
        await productService.deleteProduct(id);
        addToast({
          type: 'info',
          message: `Product "${name}" has been removed from your boutique.`
        });
        await loadProducts();
      } catch (e) {
        addToast({
          type: 'error',
          message: 'Failed to delete product.'
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Catalog Management
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Boutique Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your boutique's active garments, monitor stock counts, and edit variant options
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/products?shopId=${shopId}&shopName=${encodeURIComponent(currentShop?.name || 'Boutique')}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="View your storefront as a customer"
          >
            <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Storefront View</span>
          </Link>

          <Link
            to="/shopkeeper/products/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Boutique Scope Banner */}
      <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-soft">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Active Boutique
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                {products.length} Products
              </span>
            </div>
            <p className="font-display font-bold text-sm text-slate-900 dark:text-white">
              {currentShop?.name || user?.shopName || 'Aura Studio & Co.'}
              {currentShop?.city && (
                <span className="text-xs text-slate-400 font-normal ml-2">
                  • {currentShop.city}, {currentShop.state}
                </span>
              )}
            </p>
          </div>
        </div>

        {availableShops.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Switch Boutique:</span>
            <select
              value={shopId}
              onChange={(e) => {
                const newId = e.target.value;
                setShopId(newId);
                const match = availableShops.find(s => s.id === newId);
                if (match) setCurrentShop(match);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            >
              {availableShops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {['All', 'Women', 'Men', 'Outerwear', 'Streetwear', 'Formal', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading products for {currentShop?.name || 'boutique'}...
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3.5 px-4">Garment</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Available</th>
                  <th className="py-3.5 px-4">Sizes & Colors</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {products.map((prod) => {
                  const isOutOfStock = prod.stock === 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;
                  const displayImg = prod.images && prod.images.length > 0 ? prod.images[0] : FALLBACK_IMAGE;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImg}
                            alt={prod.name}
                            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                            className="w-12 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {prod.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {prod.images && prod.images.length > 1 && (
                                <span className="text-[10px] text-slate-400">
                                  {prod.images.length} photos
                                </span>
                              )}
                              {prod.isFeatured && (
                                <span className="px-1.5 py-0.2 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[9px] font-bold">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ${prod.price}
                        {prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-slate-400 line-through ml-1">
                            ${prod.originalPrice}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            0 units (Out of Stock)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            {prod.stock} units (Low Stock)
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {prod.stock} units
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        <p>{prod.sizes?.join(', ')}</p>
                        <p className="text-[10px] text-slate-400">
                          {prod.colors?.map(c => c.name).join(', ')}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${prod.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/shopkeeper/products/edit/${prod.id}`}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No products found in {currentShop?.name || 'this boutique'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your boutique's signature garments to make them visible to customers on StyleSync.
            </p>
            <Link
              to="/shopkeeper/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
