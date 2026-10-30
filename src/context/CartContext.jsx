import React, { createContext, useContext, useState, useEffect } from 'react';
import { couponService } from '../services/couponService';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Filter out any legacy demo items
      return Array.isArray(parsed) ? parsed.filter(i => !i.id?.startsWith('item-demo') && i.product?.id !== 'prod-1') : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('stylesync_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('stylesync_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('stylesync_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, size, color, quantity = 1) => {
    if (!product) return;
    
    // Fallbacks if not provided
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'M';
    const chosenColor = color || (product.colors && product.colors[0]?.name) || 'Default';

    setItems(prev => {
      const existingIndex = prev.findIndex(
        it => it.product.id === product.id && it.size === chosenSize && it.color === chosenColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (product.stock && newQty > product.stock) {
          addToast({
            type: 'warning',
            message: `Only ${product.stock} units available in stock.`
          });
          updated[existingIndex].quantity = product.stock;
        } else {
          updated[existingIndex].quantity = newQty;
          addToast({
            type: 'success',
            message: `Updated quantity of ${product.name} in cart.`
          });
        }
        return updated;
      }

      addToast({
        type: 'success',
        message: `Added ${product.name} to your bag!`
      });

      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity: Math.min(quantity, product.stock || 10),
          size: chosenSize,
          color: chosenColor
        }
      ];
    });
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          const maxStock = it.product.stock || 99;
          const cappedQty = Math.min(newQty, maxStock);
          if (newQty > maxStock) {
            addToast({
              type: 'warning',
              message: `Maximum available stock is ${maxStock}.`
            });
          }
          return { ...it, quantity: cappedQty };
        }
        return it;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setItems(prev => {
      const target = prev.find(i => i.id === itemId);
      if (target) {
        addToast({
          type: 'info',
          message: `Removed ${target.product.name} from bag.`
        });
      }
      return prev.filter(it => it.id !== itemId);
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.product.price * it.quantity), 0);
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 12;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = async (code) => {
    if (!code) return { success: false, message: 'Please enter a code' };
    const primaryShopId = items[0]?.product?.shopId || 'all';
    const result = await couponService.validateCoupon(code, subtotal, primaryShopId);

    if (result.valid) {
      setAppliedCoupon(result.coupon);
      addToast({
        type: 'success',
        message: result.message
      });
      return { success: true, message: result.message };
    } else {
      addToast({
        type: 'error',
        message: result.message
      });
      return { success: false, message: result.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast({
      type: 'info',
      message: 'Coupon removed.'
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
