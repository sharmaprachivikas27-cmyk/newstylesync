import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { shopService } from '../../services/shopService';
import { useToast } from '../../context/ToastContext';
import { uploadImageToSupabase, DEFAULT_SHOP_LOGO } from '../../services/uploadService';
import { Store, UploadCloud, Check } from 'lucide-react';

export default function AddShopModal({ isOpen, onClose, onShopAdded }) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    logo: DEFAULT_SHOP_LOGO,
    logo_url: DEFAULT_SHOP_LOGO,
    description: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'warning', message: 'Please select an image file.' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.ownerName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      addToast({
        type: 'warning',
        message: 'Please fill in all required shopkeeper information.'
      });
      return;
    }

    try {
      setSaving(true);
      let logoUrl = formData.logo_url || formData.logo || DEFAULT_SHOP_LOGO;

      if (logoFile) {
        setUploadingLogo(true);
        try {
          logoUrl = await uploadImageToSupabase(logoFile, 'logos');
        } catch (uploadErr) {
          console.warn('Shop logo upload note:', uploadErr);
        } finally {
          setUploadingLogo(false);
        }
      }

      const newShop = await shopService.createShop({
        ...formData,
        logo: logoUrl,
        logo_url: logoUrl
      });

      addToast({
        type: 'success',
        title: 'Boutique Registered in Supabase',
        message: `Successfully created "${newShop.name}".`
      });

      onShopAdded?.(newShop);
      onClose();

      // Reset form
      setFormData({
        name: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        city: 'New York',
        state: 'NY',
        pincode: '10001',
        logo: DEFAULT_SHOP_LOGO,
        logo_url: DEFAULT_SHOP_LOGO,
        description: ''
      });
      setLogoFile(null);
      setLogoPreview('');
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: err.message || 'Failed to create shop in Supabase.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Fashion Boutique" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Shop Name & Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Boutique / Shop Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maison de Silk"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Shopkeeper Owner Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Charlotte Dupont"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Official Email *
            </label>
            <input
              type="email"
              required
              placeholder="boutique@stylesync.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Address & City */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Boutique Physical Address
          </label>
          <input
            type="text"
            placeholder="e.g. 542 Fifth Avenue, Suite 120"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Zip/Pincode
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Logo Image Upload with Preview */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Boutique Logo Image
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleLogoFileChange}
          />
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src={logoPreview || formData.logo || DEFAULT_SHOP_LOGO}
                alt="Logo preview"
                onError={(e) => { e.currentTarget.src = DEFAULT_SHOP_LOGO; }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{logoFile ? 'Change Logo' : 'Upload Logo'}</span>
              </button>
              <p className="text-[11px] text-slate-400">
                {logoFile ? logoFile.name : 'PNG, JPG, or WebP. Saved to Supabase Storage.'}
              </p>
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Boutique Brand Story
          </label>
          <textarea
            rows={2}
            placeholder="A brief introduction to the brand's aesthetic, heritage, or focus..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all"
          >
            <span>{saving ? 'Creating in Supabase...' : 'Register Boutique'}</span>
            <Check className="w-4 h-4" />
          </button>
        </div>

      </form>
    </Modal>
  );
}
