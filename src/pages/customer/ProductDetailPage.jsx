import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/customer/ProductCard';
import { DEFAULT_PRODUCT_IMAGE } from '../../services/uploadService';
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  Check,
  ChevronRight,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const item = await productService.getProductById(id);
        if (item) {
          setProduct(item);
          setSelectedSize(item.sizes ? item.sizes[0] : '');
          setSelectedColor(item.colors ? item.colors[0]?.name : '');
          setSelectedImage(0);

          // Related products from same category or shop
          const allProds = await productService.getProducts({ category: item.category });
          setRelatedProducts(allProds.filter(p => p.id !== item.id).slice(0, 4));
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error('Error loading product details:', e);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading couture silhouette...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested garment could not be found or has been archived.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          Browse All Garments
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      type: 'success',
      message: 'Product link copied to clipboard!'
    });
  };

  const reviews = [
    {
      id: 'r1',
      author: 'Sophia Sterling',
      rating: 5,
      date: '2 weeks ago',
      title: 'Incredible texture and tailoring',
      comment: 'The drape of the fabric is exceptional. I wore this to an autumn evening event and received countless compliments.'
    },
    {
      id: 'r2',
      author: 'Julian M.',
      rating: 5,
      date: '1 month ago',
      title: 'True sartorial luxury',
      comment: 'Stitching and details are immaculate. Exactly as pictured. Shipping from the boutique was lightning fast.'
    },
    {
      id: 'r3',
      author: 'Evelyn Bennett',
      rating: 4,
      date: '2 months ago',
      title: 'Very chic, fits true to size',
      comment: 'Beautiful garment. Note that dry cleaning is required to preserve the fine natural fibers.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-brand-600 transition-colors">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Active Image Viewport */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
            <img
              src={product.images && product.images[selectedImage] ? product.images[selectedImage] : (product.images?.[0] || DEFAULT_PRODUCT_IMAGE)}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
              }}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discountPct && (
                <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-coral-500 text-white shadow-sm">
                  Save {discountPct}%
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-brand-600 text-white shadow-sm">
                  Runway Drop
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:scale-110 transition-all shadow-soft"
              title="Share item"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx
                      ? 'border-brand-600 ring-2 ring-brand-500/30 scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & Purchase Box */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Shop name & verified badge */}
            <div className="flex items-center justify-between">
              <Link
                to={`/products?shopId=${product.shopId}&shopName=${encodeURIComponent(product.shopName || '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold transition-colors"
                title={`Explore all items from ${product.shopName}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-coral-500" />
                <span>Boutique: {product.shopName}</span>
              </Link>

              {/* In stock / Low stock pill */}
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
                  Only {product.stock} units left
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  In Stock ({product.stock})
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews preview */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating || 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {product.rating?.toFixed(1) || '4.9'}
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount || 42} verified customer reviews)
              </span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-slate-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {discountPct && (
                <span className="text-xs font-bold text-coral-600 dark:text-coral-400">
                  Save ${product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Color Swatch Picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-slate-500">Color Palette</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === c.name
                          ? 'ring-2 ring-brand-600 dark:ring-brand-400 ring-offset-2 dark:ring-offset-slate-950 scale-110'
                          : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className={`w-3.5 h-3.5 ${c.hex === '#f8fafc' ? 'text-slate-900' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-slate-500">Select Size</span>
                  <span className="text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">Size Guide</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === sz
                          ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-brand-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pt-2 flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Bag + Wishlist */}
            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  isFavorited
                    ? 'border-coral-500 bg-coral-500 text-white shadow-coral-glow'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-coral-400'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <span><strong>24-Hour Cancellation Guarantee:</strong> Cancel or return directly within 24h of purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-coral-500 shrink-0" />
                <span>Complimentary tracked shipping over $150</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Verified Authentic Artisan Garment</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tabs Section: Description, Fabric, Reviews */}
      <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold mb-6 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'description'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Silhouettes & Details
            {activeTab === 'description' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('fabric')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'fabric'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Material & Care
            {activeTab === 'fabric' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Customer Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'description' && (
          <div className="max-w-3xl space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>{product.description}</p>
            <p>
              Designed and precision manufactured for modern proportion and effortless comfort.
              Tailored with sustainable methods, finished with reinforced stitching to ensure enduring elegance.
            </p>
          </div>
        )}

        {activeTab === 'fabric' && (
          <div className="max-w-xl space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Fabric Composition</h4>
              <p className="font-semibold text-slate-900 dark:text-white">{product.fabric}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Care Instructions</h4>
              <p className="text-slate-600 dark:text-slate-400">{product.care}</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6 max-w-3xl">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white">{rev.author}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">Verified Buyer</span>
                  </div>
                  <span className="text-xs text-slate-400">{rev.date}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <h5 className="font-semibold text-xs text-slate-900 dark:text-white">{rev.title}</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
