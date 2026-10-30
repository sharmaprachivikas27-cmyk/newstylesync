import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { addToast } = useToast();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(id => !id.startsWith('prod-')) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('stylesync_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = (productId) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast({
          type: 'info',
          message: 'Item removed from your wishlist.'
        });
        return prev.filter(id => id !== productId);
      } else {
        addToast({
          type: 'success',
          message: 'Saved to your wishlist!'
        });
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
