# StyleSync – Smart Clothing Store 👗✨

A responsive, multi-role e-commerce web application built with **React 18 + Vite + Tailwind CSS + React Router**. Designed with luxury editorial aesthetics, seamless Light/Dark mode, and structured with service abstractions in `/src/services` for direct connection to Supabase or any REST/GraphQL backend.

---

## 🌟 Key Features

### 🎨 Design & Aesthetics
- **Fashion Atelier Look**: Big high-resolution garment imagery (Unsplash CDN), rounded cards, glassmorphic accents, soft drop shadows, and subtle micro-transitions.
- **Full Light & Dark Theme**: Toggle in Navbar, persists in `localStorage` (`stylesync_theme`), and respects user system preferences (`prefers-color-scheme`).
- **Curated Palette**: Deep violet/indigo (`#7c3aed`) with coral/rose accents (`#f43f5e`).
- **Typography**: Google Fonts Inter and Poppins.
- **Mobile-First & Responsive**: Includes loading skeletons, empty states, and animated toast notifications.

---

## 👥 Three Roles & Role-Based Access

The application features an interactive **Role Switcher Banner** at the top of every screen to let reviewers and developers test all three role perspectives instantly with 1-click.

### 1. 👑 Admin (`/admin`)
- **Shops Management**: Comprehensive directory of all registered boutiques.
- **Search & Filtering**: Search boutiques by name, shopkeeper, or city; filter by active vs. disabled.
- **Register New Boutique**: Modal form to add shop name, owner name, address, phone, email, and logo image.
- **Inspect Boutique Dossier** (`/admin/shops/:id`):
  - Shopkeeper profile & physical atelier details
  - Products catalog count & stock summary (healthy vs. low stock vs. out of stock)
  - Order history & lifetime settled GMV
- **Enable / Disable Toggle**: Instantly activate or suspend vendor boutiques with live feedback.

### 2. 🏬 Shopkeeper (`/shopkeeper`)
- **Executive Dashboard**:
  - Live metric cards: Total Products, Low Stock Alerts (≤5), Out of Stock (0), Orders Today, Revenue.
  - Interactive 7-Day sales bar chart & segmented inventory health distribution visualizer.
- **Product Catalog & Management** (`/shopkeeper/inventory`):
  - Add, edit, and delete garments.
  - Multi-size selector (XS, S, M, L, XL, XXL, 38R, 40R, 42R).
  - Dynamic color variation chips with hex color picker.
  - Multiple image URLs support with 1-click fashion preset gallery.
  - Fabric composition, care instructions, and featured flags.
- **Customer Orders & Tracking** (`/shopkeeper/orders`):
  - Advance orders through the fulfillment flow: `Placed` → `Confirmed` → `Packed` → `Shipped` → `Delivered`.
  - Visual order timeline logger with tracking notes (e.g., courier tracking numbers).
- **24-Hour Return / Cancel Requests** (`/shopkeeper/returns`):
  - View requests submitted by customers within the 24-hour purchase window.
  - **Approve Request**: Automatically transitions order to `Cancelled` or `Returned`.
  - **Reject Request**: Allows shopkeeper to input a reason for decline recorded in the timeline.
- **Offers & Promotional Coupons** (`/shopkeeper/offers`):
  - Create percentage or flat discounts with minimum spend constraints and expiry dates.
- **Customer Feedback** (`/shopkeeper/feedback`):
  - Review star ratings, average boutique score, and comments left by verified buyers.
- **Payment Gateway Options** (`/shopkeeper/payments`):
  - Toggle **UPI**, **Card**, and **Cash on Delivery (COD)** on/off. Customer checkout dynamically adapts to these toggles!

### 3. 🛍️ Customer (`/`)
- **Editorial Home Page**: Hero banner with capsule promotions, category cards, featured designer pieces, coupon discount vouchers, and runway drops.
- **Product Catalog** (`/products`):
  - Live search.
  - Filters: Category, Price slider, Size chips, Color swatches, and In-Stock only toggle.
  - Sorting: Featured, Price (low-high / high-low), Highest Rated, Newest.
- **Product Detail Page** (`/products/:id`):
  - Multi-image gallery with thumbnail selection and zoom hover.
  - Size and color picker with active indicators.
  - Stock availability badges.
  - Accordion tabs: Silhouettes & Details, Fabric & Care, Customer Reviews.
  - Related boutique recommendations.
- **Saved Wishlist** (`/wishlist`): Save favorite items with 1-click move to bag.
- **Shopping Bag** (`/cart`):
  - Line items with size/color chips, quantity adjustment, and removal.
  - Coupon code input (e.g. `STYLE20`, `WELCOME50`) with live validation and discount calculations.
  - Free shipping indicator (orders over $150).
- **Checkout** (`/checkout`):
  - Delivery recipient, address, and pincode form.
  - Payment method selection (Card, UPI, COD) reflecting the boutique's enabled payment methods.
- **My Orders & 24h Window Tracking** (`/orders`):
  - Visual step-by-step order tracking timeline.
  - **Live 24-Hour Countdown Timer**: Displays exact remaining time (`21h 34m 12s remaining`).
  - **Request Return/Cancel Button**: Prominently visible ONLY within the 24-hour window, automatically hides once the 24h period elapses!
  - Post-delivery rating and star review modal for delivered items.

---

## 📂 Project Architecture

```
src/
├── context/
│   ├── AuthContext.jsx         # Multi-role authentication & 1-click demo logins
│   ├── ThemeContext.jsx        # Dark/Light mode with localStorage & system fallback
│   ├── CartContext.jsx         # Cart items, qty, subtotal, coupon discounts
│   ├── WishlistContext.jsx     # Saved favorites state
│   └── ToastContext.jsx        # Floating notifications stack
├── services/                   # Supabase-Ready Service Layer
│   ├── storage.js              # Initial seeding & persistence layer
│   ├── shopService.js          # Boutiques CRUD, status toggling, metrics
│   ├── productService.js       # Products search, filters, CRUD
│   ├── orderService.js         # Order lifecycle, timeline, 24h window calculation
│   ├── couponService.js        # Promo coupons validation & creation
│   └── settingsService.js      # Boutique payment methods settings
├── data/
│   ├── mockShops.js            # Initial realistic multi-shop vendors
│   ├── mockProducts.js         # 21 realistic garments with high-res images
│   ├── mockOrders.js           # Orders across different lifecycle stages (some within 24h)
│   └── mockOffers.js           # Promotional discount codes (e.g. STYLE20)
├── components/
│   ├── common/                 # Navbar, Footer, RoleSwitcherBanner, OrderTimeline, Modals
│   ├── customer/               # HeroBanner, CategorySection, ProductCard, ProductFilters
│   ├── shopkeeper/             # ShopSidebar, StatsCard, InventoryChart
│   └── admin/                  # AdminSidebar, AddShopModal
├── layouts/
│   ├── CustomerLayout.jsx      # Storefront layout
│   ├── ShopkeeperLayout.jsx    # Shopkeeper portal layout
│   └── AdminLayout.jsx         # Admin console layout
├── pages/
│   ├── customer/               # Home, Products, Detail, Cart, Checkout, Wishlist, Orders
│   ├── shopkeeper/             # Dashboard, Inventory, ProductForm, Orders, Returns, Offers, Payments, Feedback
│   ├── admin/                  # Dashboard, Shops, ShopDetail
│   └── auth/                   # LoginPage, SignupPage, NotFoundPage
└── routes/
    ├── ProtectedRoute.jsx      # Role access controller
    └── AppRoutes.jsx           # Route declarations
```

---

## 🚀 Running the Project Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔑 Demo Credentials (Or Use 1-Click Banner)

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Alexander Cross | `admin@stylesync.com` | `password123` |
| **Shopkeeper** | Sarah Jenkins | `sarah@aurastudio.com` | `password123` |
| **Customer** | Alex Rivera | `alex@example.com` | `password123` |

---

## 🔌 Connecting Supabase

All database operations are encapsulated in `/src/services`. To connect Supabase:
1. Install `@supabase/supabase-js`.
2. Initialize the client in `/src/services/supabaseClient.js`.
3. Replace the `getStorageData` / `setStorageData` calls in `shopService.js`, `productService.js`, and `orderService.js` with `supabase.from('...').select()` / `.insert()` / `.update()` queries.
