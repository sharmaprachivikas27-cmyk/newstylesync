import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import ShopkeeperLayout from '../layouts/ShopkeeperLayout';
import AdminLayout from '../layouts/AdminLayout';

// Guard
import ProtectedRoute from './ProtectedRoute';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import ProductsPage from '../pages/customer/ProductsPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import WishlistPage from '../pages/customer/WishlistPage';
import OrdersPage from '../pages/customer/OrdersPage';
import ShopsDirectoryPage from '../pages/customer/ShopsDirectoryPage';

// Shopkeeper Pages
import DashboardPage from '../pages/shopkeeper/DashboardPage';
import InventoryPage from '../pages/shopkeeper/InventoryPage';
import ProductFormPage from '../pages/shopkeeper/ProductFormPage';
import ShopOrdersPage from '../pages/shopkeeper/ShopOrdersPage';
import ReturnRequestsPage from '../pages/shopkeeper/ReturnRequestsPage';
import OffersPage from '../pages/shopkeeper/OffersPage';
import FeedbackPage from '../pages/shopkeeper/FeedbackPage';
import PaymentSettingsPage from '../pages/shopkeeper/PaymentSettingsPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminShopsPage from '../pages/admin/AdminShopsPage';
import AdminShopDetailPage from '../pages/admin/AdminShopDetailPage';

// Auth & Fallback
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Routes (Storefront) */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shops" element={<ShopsDirectoryPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Shopkeeper Portal Routes (Protected for 'shopkeeper') */}
      <Route
        path="/shopkeeper"
        element={
          <ProtectedRoute allowedRoles={['shopkeeper', 'admin']}>
            <ShopkeeperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/edit/:id" element={<ProductFormPage />} />
        <Route path="orders" element={<ShopOrdersPage />} />
        <Route path="returns" element={<ReturnRequestsPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="payments" element={<PaymentSettingsPage />} />
      </Route>

      {/* Admin Portal Routes (Protected for 'admin') */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="shops" element={<AdminShopsPage />} />
        <Route path="shops/:id" element={<AdminShopDetailPage />} />
      </Route>
    </Routes>
  );
}
