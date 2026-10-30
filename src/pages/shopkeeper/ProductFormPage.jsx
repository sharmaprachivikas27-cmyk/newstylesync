import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  uploadMultipleImagesToSupabase,
  DEFAULT_PRODUCT_IMAGE
} from '../../services/uploadService';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Sparkles,
  UploadCloud,
  Star,
  Store,
  Layers,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38R', '40R', '42R', 'One Size'];

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  // Active shopkeeper scope
  const [assignedShopId, setAssignedShopId] = useState(user?.shopId || '');
  const [assignedShopName, setAssignedShopName] = useState(user?.shopName || 'My Boutique');
  const [availableShops, setAvailableShops] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Women',
    price: '',
    originalPrice: '',
    stock: '',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Midnight Onyx', hex: '#0f172a' }
    ],
    images: [],
    image_urls: [],
    description: '',
    fabric: '100% Organic Cotton',
    care: 'Cold delicate wash, line dry in shade.',
    isFeatured: false
  });

  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#7c3aed');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  // Load shop owned by current shopkeeper or available shops for admin
  useEffect(() => {
    async function initShopScope() {
      if (user?.id) {
        if (user.shopId) {
          setAssignedShopId(user.shopId);
          setAssignedShopName(user.shopName || 'My Boutique');
          setAvailableShops([{ id: user.shopId, name: user.shopName || 'My Boutique' }]);
          return;
        }

        const myShop = await shopService.getShopByOwnerId(user.id);
        if (myShop) {
          setAssignedShopId(myShop.id);
          setAssignedShopName(myShop.name);
          setAvailableShops([myShop]);
          return;
        }

        // If user is a shopkeeper without a shop row, create one automatically
        try {
          const createdShop = await shopService.createShop({
            shopkeeper_id: user.id,
            name: `${user.name || 'Designer'}'s Boutique`,
            owner_name: user.name || 'Shopkeeper',
            email: user.email || '',
            phone: user.phone || '',
            address: 'Fashion District',
            city: 'New York',
            state: 'NY',
            pincode: '10001',
            description: 'Exclusive boutique curated by designer.'
          });
          if (createdShop) {
            setAssignedShopId(createdShop.id);
            setAssignedShopName(createdShop.name);
            setAvailableShops([createdShop]);
            return;
          }
        } catch (e) {
          console.warn('Auto-create boutique notice:', e);
        }
      }

      // Fallback: list shops
      const shops = await shopService.getShops();
      if (shops && shops.length > 0) {
        setAvailableShops(shops);
        if (!assignedShopId) {
          setAssignedShopId(shops[0].id);
          setAssignedShopName(shops[0].name);
        }
      }
    }
    initShopScope();
  }, [user]);

  // Load product if editing
  useEffect(() => {
    if (isEditing) {
      async function fetchProduct() {
        try {
          setLoading(true);
          const item = await productService.getProductById(id);
          if (item) {
            const productImages = item.images && item.images.length > 0
              ? item.images
              : (item.image_urls && item.image_urls.length > 0 ? item.image_urls : []);

            setFormData({
              name: item.name || '',
              category: item.category || 'Women',
              price: item.price !== undefined ? item.price : '',
              originalPrice: item.originalPrice !== undefined ? item.originalPrice : '',
              stock: item.stock !== undefined ? item.stock : '',
              sizes: item.sizes && item.sizes.length ? item.sizes : ['S', 'M', 'L'],
              colors: item.colors && item.colors.length ? item.colors : [{ name: 'Classic Black', hex: '#18181b' }],
              images: productImages,
              image_urls: productImages,
              description: item.description || '',
              fabric: item.fabric || '',
              care: item.care || '',
              isFeatured: !!item.isFeatured
            });

            if (item.shopId) {
              setAssignedShopId(item.shopId);
              setAssignedShopName(item.shopName || 'Boutique');
            }
          }
        } catch (e) {
          console.error('Fetch product error:', e);
          addToast({ type: 'error', message: 'Failed to load product.' });
        } finally {
          setLoading(false);
        }
      }
      fetchProduct();
    }
  }, [id, isEditing]);

  const toggleSize = (sz) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(sz);
      const nextSizes = exists ? prev.sizes.filter(s => s !== sz) : [...prev.sizes, sz];
      return { ...prev, sizes: nextSizes };
    });
  };

  // MULTIPLE IMAGE UPLOAD TO SUPABASE STORAGE "product-images"
  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList).filter(f => f.type && f.type.startsWith('image/'));

    if (files.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please choose valid image files (JPG, PNG, WebP).'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(`Uploading 1 of ${files.length} to Supabase...`);

      const uploadedUrls = await uploadMultipleImagesToSupabase(
        files,
        (current, total) => {
          setUploadProgress(`Uploading ${current} of ${total} to Supabase...`);
        },
        'products'
      );

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          image_urls: [...(prev.image_urls || []), ...uploadedUrls]
        }));

        addToast({
          type: 'success',
          title: 'Images Ready!',
          message: `${uploadedUrls.length} image(s) processed and ready to save.`
        });
      }
    } catch (err) {
      console.error('Image upload error:', err);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to upload images to Supabase Storage.'
      });
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image_urls: newImages
      };
    });
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const selected = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      const reordered = [selected, ...rest];
      return {
        ...prev,
        images: reordered,
        image_urls: reordered
      };
    });
    addToast({ type: 'info', message: 'Set as primary cover photo.' });
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }]
    }));
    setNewColorName('');
  };

  const handleRemoveColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assignedShopId) {
      addToast({
        type: 'error',
        message: 'No boutique found for your shopkeeper profile. Please ensure your shop exists.'
      });
      return;
    }

    if (!formData.name.trim() || formData.price === '' || formData.stock === '') {
      addToast({
        type: 'warning',
        message: 'Please fill in all mandatory product information (title, price, stock).'
      });
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please upload at least one product image before saving.'
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        stock: Number(formData.stock),
        sizes: formData.sizes,
        colors: formData.colors,
        images: formData.images,
        image_urls: formData.images,
        description: formData.description,
        fabric: formData.fabric,
        care: formData.care,
        isFeatured: Boolean(formData.isFeatured),
        shopId: assignedShopId,
        shopName: assignedShopName
      };

      if (isEditing) {
        await productService.updateProduct(id, payload);
        addToast({
          type: 'success',
          title: 'Product Updated in Supabase',
          message: `Saved changes to "${formData.name}".`
        });
      } else {
        await productService.createProduct(payload);
        addToast({
          type: 'success',
          title: 'Product Created in Supabase',
          message: `Added "${formData.name}" to your boutique catalog.`
        });
      }
      navigate('/shopkeeper/inventory');
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save product in Supabase.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
        Loading product form from Supabase...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <Link
          to="/shopkeeper/inventory"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {isEditing ? 'Modify Boutique Garment' : 'New Catalog Entry'}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {isEditing ? `Edit: ${formData.name}` : 'Add New Product'}
          </h1>
        </div>
      </div>

      {/* Boutique Scope Indicator */}
      <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-soft">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Active Boutique Scope
            </p>
            <p className="font-display font-bold text-sm text-slate-900 dark:text-white">
              {assignedShopName}
            </p>
          </div>
        </div>

        {availableShops.length > 1 && user?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Boutique:</label>
            <select
              value={assignedShopId}
              onChange={(e) => {
                const sId = e.target.value;
                setAssignedShopId(sId);
                const match = availableShops.find(s => s.id === sId);
                if (match) setAssignedShopName(match.name);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            >
              {availableShops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Info Box */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Garment Basics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sculpted Wool Double-Breasted Trench"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Formal">Formal</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Available Stock Count *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 18"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Selling Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 189"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Original MSRP Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 249 (optional for discount badge)"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* IMAGE UPLOADER SECTION (SUPABASE STORAGE BUCKET 'product-images') */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Product Photography
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload garment photos to Supabase Storage. Multi-image selection supported.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800 self-start sm:self-auto">
              {formData.images.length} photo(s) added
            </span>
          </div>

          {/* Hidden File Input for Multiple Uploads */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center shadow-soft">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {uploading ? uploadProgress : 'Click to Upload Images or Drag & Drop'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Upload multiple photos from your device (JPG, PNG, WebP). Files are saved to Supabase Storage.
                </p>
              </div>

              <button
                type="button"
                disabled={uploading}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft transition-all"
              >
                Browse Multiple Images
              </button>
            </div>
          </div>

          {/* Live Gallery Previews */}
          {formData.images.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Gallery Previews (First photo is Cover Photo):</span>
                <span className="text-[11px] text-slate-400">Hover photo to set as cover or remove</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                {formData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
                  >
                    <img
                      src={img}
                      alt={`Product angle ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />

                    {/* Primary Badge */}
                    {i === 0 ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-extrabold shadow flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(i)}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 hover:bg-brand-600 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Set as main cover image"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Delete Action */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all shadow"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sizes & Colors */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-5">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Available Sizes & Colorways
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Offered Sizes (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map(sz => {
                const isSelected = formData.sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-soft scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Colorways
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {formData.colors.map((c, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent p-0"
              />
              <input
                type="text"
                placeholder="Color name (e.g. Sage Green)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Narrative & Craft Box */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Description & Fabric Craft
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Garment Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe silhouette, tailoring inspiration, and fit details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Fabric & Composition
              </label>
              <input
                type="text"
                placeholder="e.g. 70% Virgin Wool, 30% Mulberry Silk"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Care Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Specialist eco-dry clean only."
                value={formData.care}
                onChange={(e) => setFormData({ ...formData, care: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Feature this garment on the store homepage showcase
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/shopkeeper/inventory"
            className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-soft hover:scale-[1.01] transition-all"
          >
            <span>{saving ? 'Saving to Supabase...' : isEditing ? 'Save Changes' : 'Publish Product'}</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
