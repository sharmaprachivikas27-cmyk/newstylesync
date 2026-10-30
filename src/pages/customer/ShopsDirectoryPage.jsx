import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../../services/shopService';
import { DEFAULT_SHOP_LOGO, DEFAULT_SHOP_BANNER } from '../../services/uploadService';
import { Store, Star, MapPin, ArrowRight, ShieldCheck, Sparkles, Package } from 'lucide-react';

export default function ShopsDirectoryPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadShops() {
      try {
        setLoading(true);
        const data = await shopService.getShops({ status: 'enabled' });
        setShops(data || []);
      } catch (err) {
        console.error('Failed to load shops:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShops();
  }, []);

  const filteredShops = shops.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 text-xs font-semibold">
          <Store className="w-3.5 h-3.5 text-coral-500" />
          <span>Independent Ateliers & Boutiques</span>
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Explore Curated Boutiques
        </h1>
        <p className="text-sm text-slate-500">
          Discover unique independent designers and tailored collections. Select any boutique to explore and shop their exclusive catalog.
        </p>

        {/* Search */}
        <div className="pt-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search boutique by name, city, or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-soft"
          />
        </div>
      </div>

      {/* Boutiques Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
              <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Boutiques Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-soft hover:shadow-lg transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              <div>
                {/* Banner & Logo */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={shop.banner || shop.banner_url || DEFAULT_SHOP_BANNER}
                    alt={shop.name}
                    onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_BANNER; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Shop Logo Avatar */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <img
                      src={shop.logo || shop.logo_url || DEFAULT_SHOP_LOGO}
                      alt={shop.name}
                      onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_LOGO; }}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-900 shadow-md"
                    />
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-white drop-shadow-sm">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-coral-400" />
                        <span>{shop.address || [shop.city, shop.state].filter(Boolean).join(', ') || 'Independent Atelier'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{shop.rating || '5.0'}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {shop.description || 'Curated designer collection featuring sustainable tailoring and modern aesthetics.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-medium">Designer: {shop.owner_name || shop.ownerName || 'Verified Designer'}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      Verified Boutique
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Link
                  to={`/products?shopId=${shop.id}&shopName=${encodeURIComponent(shop.name)}`}
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:gap-3"
                >
                  <span>Explore {shop.name} Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
