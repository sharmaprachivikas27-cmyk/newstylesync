import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/common/EmptyState';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Clock, X } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    itemCount,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    total
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode);
    setApplying(false);
  };

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="Looks like you haven't added any luxury pieces to your bag yet. Explore our curated capsules and new drops."
          actionText="Explore Collections"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 mb-8 flex items-baseline justify-between">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <Link to="/products" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0">
                <Link to={`/products/${item.product.id}`} className="shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.product.images ? item.product.images[0] : ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-coral-500 tracking-wider">
                    {item.product.shopName}
                  </span>
                  <Link
                    to={`/products/${item.product.id}`}
                    className="block font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate"
                  >
                    {item.product.name}
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                      Size: {item.size}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium truncate">
                      {item.color}
                    </span>
                  </div>

                  <p className="font-display font-bold text-sm text-slate-900 dark:text-white pt-1">
                    ${item.product.price}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="font-display font-bold text-base text-slate-900 dark:text-white">
                    ${item.product.price * item.quantity}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Have a Promo Code?
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        Coupon discount applied
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-emerald-700 dark:text-emerald-400 hover:text-rose-500"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. STYLE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-semibold focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-${discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-500">FREE</strong> : `$${shippingFee}`}</span>
              </div>

              {subtotal < 150 && (
                <p className="text-[11px] text-coral-500">
                  Add ${150 - subtotal} more for complimentary express delivery!
                </p>
              )}

              <div className="flex justify-between text-sm sm:text-base font-display font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Badges */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                24h Cancel Window
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Secure Checkout
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
