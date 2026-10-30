import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../../components/customer/HeroBanner';
import CategorySection from '../../components/customer/CategorySection';
import ProductCard from '../../components/customer/ProductCard';
import { ProductSkeletonGrid } from '../../components/common/LoadingSkeleton';
import { productService } from '../../services/productService';
import { couponService } from '../../services/couponService';
import { shopService } from '../../services/shopService';
import { Sparkles, ArrowRight, Tag, Copy, Check, Store, MapPin, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SHOP_LOGO, DEFAULT_SHOP_BANNER } from '../../services/uploadService';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allProds, allOffers, allShops] = await Promise.all([
          productService.getProducts(),
          couponService.getOffers(),
          shopService.getShops({ status: 'enabled' })
        ]);

        const featured = allProds.filter(p => p.isFeatured);
        setFeaturedProducts(featured.length > 0 ? featured.slice(0, 8) : allProds.slice(0, 8));

        const newest = allProds.filter(p => p.isNew);
        setNewArrivals(newest.length > 0 ? newest.slice(0, 4) : allProds.slice(0, 4));

        setOffers(allOffers.filter(o => o.isActive).slice(0, 2));
        setShops(allShops || []);
      } catch (e) {
        console.error('Error loading home data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    addToast({
      type: 'success',
      message: `Coupon "${code}" copied to clipboard!`
    });
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* Hero Section */}
      <HeroBanner />

      {/* Category Section */}
      <CategorySection />

      {/* Featured Boutiques & Ateliers Showcase */}
      {shops.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                <Store className="w-3.5 h-3.5" />
                <span>Independent Fashion Boutiques</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Shop by Designer Boutique
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select any boutique to explore and shop their dedicated, exclusive collections
              </p>
            </div>
            <Link
              to="/shops"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
            >
              <span>Explore All {shops.length} Boutiques</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shops.slice(0, 3).map((shop) => (
              <div
                key={shop.id}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-soft hover:shadow-soft-lg transition-all hover:scale-[1.01] flex flex-col justify-between"
              >
                <div>
                  {/* Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={shop.banner || shop.banner_url || DEFAULT_SHOP_BANNER}
                      alt={shop.name}
                      onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_BANNER; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-amber-400 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{shop.rating || '5.0'}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                      <img
                        src={shop.logo || shop.logo_url || DEFAULT_SHOP_LOGO}
                        alt={shop.name}
                        onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_LOGO; }}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900 shadow"
                      />
                      <div>
                        <h3 className="font-display font-extrabold text-base text-white drop-shadow">
                          {shop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-slate-200">
                          <MapPin className="w-3 h-3 text-coral-400" />
                          <span>{shop.city || 'New York'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {shop.description || 'Exclusive boutique featuring premium fashion.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    to={`/products?shopId=${shop.id}&shopName=${encodeURIComponent(shop.name)}`}
                    className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-600 text-brand-700 hover:text-white dark:text-brand-300 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Boutique Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Curations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-coral-500 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Featured Designer Pieces
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
          >
            <span>Explore All Styles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={8} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-soft">
            <Sparkles className="w-10 h-10 text-brand-500 mx-auto mb-2" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Curated Collection Arriving Shortly</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Our independent boutiques are currently preparing fresh runway silhouettes.
            </p>
          </div>
        )}
      </section>

      {/* Promotional Offers & Vouchers Strip */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 sm:p-10 shadow-soft-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
              <Tag className="w-80 h-80 text-white" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-3">
                <span className="px-3 py-1 rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30 text-xs font-bold uppercase tracking-wider">
                  Limited Season Promos
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Exclusive Boutique Vouchers
                </h3>
                <p className="text-sm text-brand-200 max-w-lg leading-relaxed">
                  Enjoy seasonal savings across artisan shops. Apply at checkout or directly inside your shopping bag.
                </p>
              </div>

              <div className="md:col-span-5 flex flex-col gap-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-coral-400">
                        {offer.type === 'percentage' ? `${offer.value}% OFF` : `$${offer.value} OFF`}
                      </span>
                      <p className="font-display font-bold text-sm text-white">{offer.code}</p>
                      <p className="text-[11px] text-slate-300">Min. order ${offer.minOrder}</p>
                    </div>

                    <button
                      onClick={() => copyCoupon(offer.code)}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New In Runway Capsule */}
      {(loading || newArrivals.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Fresh Drops
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
                New In Runway
              </h2>
            </div>
            <Link
              to="/products?sortBy=newest"
              className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
            >
              View all new drops →
            </Link>
          </div>

          {loading ? (
            <ProductSkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
