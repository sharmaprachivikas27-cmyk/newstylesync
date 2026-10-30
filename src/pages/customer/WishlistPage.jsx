import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import EmptyState from '../../components/common/EmptyState';
import { ProductSkeletonGrid } from '../../components/common/LoadingSkeleton';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        setLoading(true);
        const allProds = await productService.getProducts();
        const filtered = allProds.filter(p => wishlistIds.includes(p.id));
        setProducts(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, [wishlistIds]);

  const handleMoveToBag = (product) => {
    const size = product.sizes ? product.sizes[0] : 'M';
    const color = product.colors ? product.colors[0]?.name : 'Default';
    addToCart(product, size, color, 1);
    toggleWishlist(product.id);
  };

  if (!wishlistIds.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save garments that catch your eye by clicking the heart icon. Return anytime to review or add them to your bag."
          actionText="Discover Designer Pieces"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 mb-8 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-coral-500">Personal Curation</span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            My Wishlist ({products.length} {products.length === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <Link to="/products" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          Explore More Pieces
        </Link>
      </div>

      {loading ? (
        <ProductSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images ? product.images[0] : ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-coral-500 hover:scale-110 shadow-soft transition-all"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-coral-500 uppercase tracking-wider block">
                    {product.shopName}
                  </span>
                  <Link
                    to={`/products/${product.id}`}
                    className="font-display font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="font-display font-bold text-sm text-slate-900 dark:text-white mt-1">
                    ${product.price}
                  </p>
                </div>

                <button
                  onClick={() => handleMoveToBag(product)}
                  disabled={product.stock === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-50 text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stock === 0 ? 'Out of Stock' : 'Move to Bag'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
