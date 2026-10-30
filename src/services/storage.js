/**
 * Storage utilities for local UI state (persisting theme, cart, etc.)
 * Demo/mock seeding has been completely removed to ensure pure Supabase connectivity.
 */

const STORAGE_KEYS = {
  SHOPS: 'stylesync_shops_v1',
  PRODUCTS: 'stylesync_products_v1',
  ORDERS: 'stylesync_orders_v1',
  OFFERS: 'stylesync_offers_v1',
  INITIALIZED: 'stylesync_initialized_v2'
};

export function initStorage() {
  // Clear any legacy mock data from previous sessions
  if (localStorage.getItem('stylesync_initialized_v1')) {
    localStorage.removeItem('stylesync_shops_v1');
    localStorage.removeItem('stylesync_products_v1');
    localStorage.removeItem('stylesync_orders_v1');
    localStorage.removeItem('stylesync_offers_v1');
    localStorage.removeItem('stylesync_initialized_v1');
  }
}

export function getStorageData(key, fallback = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage read error for key:', key, e);
    return fallback;
  }
}

export function setStorageData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error for key:', key, e);
  }
}

export const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

export { STORAGE_KEYS };
