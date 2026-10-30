import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { DEFAULT_PRODUCT_IMAGE } from '../../services/uploadService';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultSize = product.sizes ? product.sizes[0] : 'M';
    const defaultColor = product.colors ? product.colors[0]?.name : 'Default';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const productImage = (product.images && product.images[0]) || (product.image_urls && product.image_urls[0]) || DEFAULT_PRODUCT_IMAGE;

  return (
    <div className="group relative flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden">
      
      {/* Image Container with Badges */}
      <Link to={`/products/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={productImage}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
          }}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleFavoriteToggle}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
            isFavorited
              ? 'bg-coral-500 text-white shadow-coral-glow'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {discountPct && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase rounded-full bg-coral-500 text-white shadow-sm">
              -{discountPct}%
            </span>
          )}
          {product.isNew && !discountPct && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase rounded-full bg-brand-600 text-white shadow-sm">
              New In
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase rounded-full bg-slate-800/90 text-white backdrop-blur">
              Sold Out
            </span>
          )}
          {isLowStock && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-amber-500 text-white shadow-sm">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Quick Add Overlay on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950/90 dark:bg-white/95 text-white dark:text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 backdrop-blur shadow-lg hover:scale-[1.02] transition-transform"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Quick Add</span>
            </button>
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Shop Tag & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            {product.shopId ? (
              <Link
                to={`/products?shopId=${product.shopId}&shopName=${encodeURIComponent(product.shopName || '')}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-brand-600 dark:text-brand-400 hover:underline truncate max-w-[65%]"
                title={`Browse ${product.shopName} boutique`}
              >
                {product.shopName}
              </Link>
            ) : (
              <span className="font-medium text-brand-600 dark:text-brand-400 truncate max-w-[65%]">
                {product.shopName}
              </span>
            )}
            {product.rating && (
              <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400">({product.reviewsCount || 0})</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.id}`}
            className="font-display font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {product.name}
          </Link>

          {/* Category & Sizes snippet */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              {product.category}
            </span>
            {product.sizes && product.sizes.length > 0 && (
              <span className="text-[10px] text-slate-400 truncate">
                • {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? '...' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="font-display font-bold text-base text-slate-900 dark:text-white">
            ${product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
