import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../../components/customer/ProductCard';
import ProductFilters from '../../components/customer/ProductFilters';
import { ProductSkeletonGrid } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Store,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlShopId = searchParams.get('shopId') || 'all';
  const urlShopName = searchParams.get('shopName') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sortBy') || 'featured';

  const MAX_PRICE = 2000;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [selectedShopId, setSelectedShopId] = useState(urlShopId);
  const [selectedShopName, setSelectedShopName] = useState(urlShopName);
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL changes externally
  useEffect(() => {
    const sId = searchParams.get('shopId') || 'all';
    const sName = searchParams.get('shopName') || '';
    const uCat = searchParams.get('category') || 'All';
    const uSearch = searchParams.get('search') || '';
    const uSort = searchParams.get('sortBy') || 'featured';

    setSelectedShopId(sId);
    setSelectedShopName(sName);
    setCategory(uCat);
    setSearch(uSearch);
    setSortBy(uSort);
  }, [searchParams]);

  // Load categories and shops
  useEffect(() => {
    async function initData() {
      const [cats, shopsList] = await Promise.all([
        productService.getCategories(),
        shopService.getShops({ status: 'enabled' })
      ]);
      setCategories(cats);
      setShops(shopsList || []);

      if (urlShopId !== 'all' && !urlShopName && shopsList) {
        const match = shopsList.find(s => s.id === urlShopId);
        if (match) setSelectedShopName(match.name);
      }
    }
    initData();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    async function fetchFiltered() {
      try {
        setLoading(true);
        const results = await productService.getProducts({
          shopId: selectedShopId,
          search,
          category,
          minPrice: priceRange[0] > 0 ? priceRange[0] : 0,
          maxPrice: priceRange[1] < MAX_PRICE ? priceRange[1] : 10000,
          size,
          color,
          inStockOnly,
          sortBy
        });
        setProducts(results);
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchFiltered, 100);
    return () => clearTimeout(timer);
  }, [selectedShopId, search, category, priceRange, size, color, inStockOnly, sortBy]);

  const handleSelectShop = (shopIdToSet, shopNameToSet = '') => {
    setSelectedShopId(shopIdToSet);
    setSelectedShopName(shopNameToSet);

    const nextParams = new URLSearchParams(searchParams);
    if (shopIdToSet && shopIdToSet !== 'all') {
      nextParams.set('shopId', shopIdToSet);
      if (shopNameToSet) nextParams.set('shopName', shopNameToSet);
    } else {
      nextParams.delete('shopId');
      nextParams.delete('shopName');
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setSelectedShopId('all');
    setSelectedShopName('');
    setPriceRange([0, MAX_PRICE]);
    setSize('');
    setColor('');
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedShopId !== 'all' ||
    category !== 'All' ||
    priceRange[1] < MAX_PRICE ||
    priceRange[0] > 0 ||
    size !== '' ||
    color !== '' ||
    inStockOnly ||
    search !== '';

  const activeShopObj = shops.find(s => s.id === selectedShopId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-fade-in">
      
      {/* Specific Boutique Banner if filtered */}
      {selectedShopId !== 'all' && (
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 sm:p-8 shadow-soft-lg overflow-hidden animate-fade-in">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
            <Store className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30 text-xs font-bold uppercase tracking-wider">
                <Store className="w-3.5 h-3.5 text-coral-400" />
                <span>Exclusive Boutique Collection</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                {selectedShopName || activeShopObj?.name || 'Selected Boutique'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {activeShopObj?.description || 'Browse exclusive garments designed and crafted by this independent atelier.'}
              </p>
              {activeShopObj?.city && (
                <div className="flex items-center gap-2 text-xs text-brand-200 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-coral-400" />
                  <span>{activeShopObj.city}, {activeShopObj.state}</span>
                  <span>•</span>
                  <span>Owner: {activeShopObj.owner_name || activeShopObj.ownerName}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSelectShop('all', '')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all self-start md:self-auto flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>View All Boutiques</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-coral-500">
            {selectedShopId !== 'all' ? 'Boutique Catalog' : 'Curated Storefront'}
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white mt-1">
            {selectedShopId !== 'all'
              ? `${selectedShopName || 'Boutique'} Garments`
              : category === 'All'
              ? 'All Designer Pieces'
              : `${category} Collection`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} garments {selectedShopId !== 'all' ? `exclusive to ${selectedShopName || 'this boutique'}` : 'across all ateliers'}
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search garments, fabrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-soft"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-soft cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Runway</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-coral-500" />
            )}
          </button>
        </div>
      </div>

      {/* Boutique Selector Bar (Filter by Shop Name) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
          <Store className="w-3.5 h-3.5 text-coral-500" />
          <span>Shop:</span>
        </span>

        <button
          onClick={() => handleSelectShop('all', '')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
            selectedShopId === 'all'
              ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-brand-400'
          }`}
        >
          All Boutiques
        </button>

        {shops.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelectShop(s.id, s.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedShopId === s.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400'
            }`}
          >
            <span>{s.name}</span>
            {s.city && (
              <span className="text-[10px] opacity-75 font-normal">({s.city})</span>
            )}
          </button>
        ))}

        <Link
          to="/shops"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap hover:underline ml-2"
        >
          Browse All Ateliers →
        </Link>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-1">
          <span className="text-xs text-slate-400 font-medium">Active filters:</span>
          {selectedShopId !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800">
              <Store className="w-3 h-3 text-amber-500" />
              Boutique: {selectedShopName || 'Selected'}
              <button onClick={() => handleSelectShop('all', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {category !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
              Category: {category}
              <button onClick={() => setCategory('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {size && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
              Size: {size}
              <button onClick={() => setSize('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {color && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
              Color: {color}
              <button onClick={() => setColor('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {priceRange[1] < MAX_PRICE && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
              Under ${priceRange[1]}
              <button onClick={() => setPriceRange([0, MAX_PRICE])}><X className="w-3 h-3" /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
              In Stock
              <button onClick={() => setPriceRange([0, MAX_PRICE])}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Grid & Filters Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-2">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft">
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              onSelectCategory={setCategory}
              priceRange={priceRange}
              maxPossiblePrice={MAX_PRICE}
              onChangePrice={setPriceRange}
              selectedSize={size}
              onSelectSize={setSize}
              selectedColor={color}
              onSelectColor={setColor}
              inStockOnly={inStockOnly}
              onToggleInStock={setInStockOnly}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <ProductSkeletonGrid count={6} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={selectedShopId !== 'all' ? `No garments in ${selectedShopName || 'this boutique'}` : 'No matching designer items'}
              description={
                selectedShopId !== 'all'
                  ? 'This boutique has not published garments in this category yet. Click below to view all boutique collections.'
                  : 'No products matched your exact filter combination. Try adjusting price, size, or clearing filters.'
              }
              actionText={selectedShopId !== 'all' ? 'View All Boutiques' : 'Reset All Filters'}
              onAction={selectedShopId !== 'all' ? () => handleSelectShop('all', '') : handleResetFilters}
            />
          )}
        </div>

      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-2xl animate-fade-in">
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              onSelectCategory={setCategory}
              priceRange={priceRange}
              maxPossiblePrice={MAX_PRICE}
              onChangePrice={setPriceRange}
              selectedSize={size}
              onSelectSize={setSize}
              selectedColor={color}
              onSelectColor={setColor}
              inStockOnly={inStockOnly}
              onToggleInStock={setInStockOnly}
              onResetFilters={handleResetFilters}
              onCloseMobile={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
