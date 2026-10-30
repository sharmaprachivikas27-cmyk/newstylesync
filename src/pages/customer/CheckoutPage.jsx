import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronLeft
} from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: 'New York',
    state: 'NY',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' | 'UPI' | 'Cash on Delivery'
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    exp: '',
    cvv: ''
  });
  const [enabledPayments, setEnabledPayments] = useState({ upi: true, card: true, cod: true });
  const [placingOrder, setPlacingOrder] = useState(false);

  // Check shop-specific payment settings
  useEffect(() => {
    async function loadShopPaymentMethods() {
      if (items.length > 0) {
        const primaryShopId = items[0].product.shopId || items[0].product.shop_id || null;
        try {
          const settings = await settingsService.getPaymentSettings(primaryShopId);
          if (settings) {
            setEnabledPayments(settings);
            // Default to an available method
            if (settings.card) setPaymentMethod('Card');
            else if (settings.upi) setPaymentMethod('UPI');
            else if (settings.cod) setPaymentMethod('Cash on Delivery');
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadShopPaymentMethods();
  }, [items]);

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.street || !shippingDetails.pincode) {
      addToast({
        type: 'warning',
        message: 'Please complete all delivery address fields.'
      });
      return;
    }

    try {
      setPlacingOrder(true);
      const primaryShopId = items[0]?.product?.shopId || items[0]?.product?.shop_id || null;
      const primaryShopName = items[0]?.product?.shopName || 'Boutique';

      const orderPayload = {
        customerId: user?.id || null,
        customerName: shippingDetails.fullName,
        customerEmail: shippingDetails.email,
        customerPhone: shippingDetails.phone,
        shopId: primaryShopId,
        shopName: primaryShopName,
        items: items.map(it => ({
          productId: it.product.id,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
          image: it.product.images ? it.product.images[0] : ''
        })),
        subtotal,
        discount: discountAmount,
        shippingFee,
        total,
        paymentMethod,
        shippingAddress: { ...shippingDetails }
      };

      const createdOrder = await orderService.createOrder(orderPayload);
      clearCart();

      addToast({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Order #${createdOrder.id} is confirmed. Your 24-hour return window is now active.`
      });

      navigate('/orders');
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to place order.'
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/cart" className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-coral-500">Fast & Secure</span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Delivery & Payment Details
          </h1>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Delivery Form & Payment Choice */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Shipping Address Box */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.fullName}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={shippingDetails.phone}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={shippingDetails.street}
                onChange={(e) => setShippingDetails({ ...shippingDetails, street: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.city}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.state}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Zip/Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.pincode}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              2. Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* Card Option */}
              {enabledPayments.card && (
                <label
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Card"
                        checked={paymentMethod === 'Card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Credit / Debit Card</p>
                        <p className="text-xs text-slate-500">Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">Instant</span>
                  </div>

                  {paymentMethod === 'Card' && (
                    <div className="mt-4 pt-3 border-t border-brand-200/60 dark:border-brand-900/40 grid grid-cols-2 gap-3 text-xs animate-fade-in">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Card Number</label>
                        <input
                          type="text"
                          readOnly
                          value={cardDetails.number}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Expires</label>
                        <input
                          type="text"
                          readOnly
                          value={cardDetails.exp}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">CVV</label>
                        <input
                          type="text"
                          readOnly
                          value={cardDetails.cvv}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                </label>
              )}

              {/* UPI Option */}
              {enabledPayments.upi && (
                <label
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <QrCode className="w-5 h-5 text-coral-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">UPI / QR Code</p>
                        <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">Zero Fees</span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-4 pt-3 border-t border-brand-200/60 dark:border-brand-900/40 space-y-2 animate-fade-in">
                      <label className="block text-[11px] font-medium text-slate-500">Enter UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </label>
              )}

              {/* Cash On Delivery Option */}
              {enabledPayments.cod && (
                <label
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <Banknote className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Cash on Delivery</p>
                        <p className="text-xs text-slate-500">Pay cash or UPI at delivery doorstep</p>
                      </div>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-5">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Review Bag Items
            </h3>

            {/* Items snippet */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.product.images ? it.product.images[0] : ''}
                      alt={it.product.name}
                      className="w-10 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{it.product.name}</p>
                      <p className="text-slate-500 text-[10px]">
                        {it.size} • Qty: {it.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    ${it.product.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-display font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Submit Place Order Button */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{placingOrder ? 'Processing Order...' : `Confirm & Place Order ($${total})`}</span>
            </button>

            {/* 24-Hour Return Guarantee callout */}
            <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/40 flex items-start gap-2.5 text-xs">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-brand-900 dark:text-brand-200">24-Hour Easy Return Guarantee</p>
                <p className="text-[11px] text-brand-700 dark:text-brand-400 mt-0.5">
                  You can cancel or return this order anytime within 24 hours of placing it directly from the My Orders dashboard.
                </p>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
