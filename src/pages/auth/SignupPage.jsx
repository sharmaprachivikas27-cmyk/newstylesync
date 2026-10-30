import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadImageToSupabase, DEFAULT_SHOP_LOGO } from '../../services/uploadService';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Store,
  ShoppingBag,
  MapPin,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  const [role, setRole] = useState('customer'); // 'customer' | 'shopkeeper'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    // Shopkeeper specific fields:
    shopName: '',
    shopAddress: '',
    shopDescription: '',
    logoUrl: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'warning', message: 'Please select a valid image file.' });
      return;
    }
    setLogoFile(file);
    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      addToast({ type: 'warning', message: 'Please fill in all mandatory account fields.' });
      return;
    }

    if (role === 'shopkeeper') {
      if (!formData.shopName.trim() || !formData.shopAddress.trim()) {
        addToast({ type: 'warning', message: 'Please provide your Shop Name and Shop Address.' });
        return;
      }
    }

    try {
      setLoading(true);

      let uploadedLogoUrl = formData.logoUrl;
      // If a shopkeeper selected a logo file, upload to Supabase Storage
      if (role === 'shopkeeper' && logoFile) {
        setUploadingLogo(true);
        try {
          uploadedLogoUrl = await uploadImageToSupabase(logoFile, 'logos');
        } catch (uploadErr) {
          console.warn('Logo upload note:', uploadErr.message);
          // If storage bucket is not created yet, proceed without blocking signup
          addToast({
            type: 'warning',
            message: 'Logo upload will use default until storage bucket is active.'
          });
        } finally {
          setUploadingLogo(false);
        }
      }

      const res = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        shopName: formData.shopName,
        shopAddress: formData.shopAddress,
        shopDescription: formData.shopDescription,
        logoUrl: uploadedLogoUrl
      });

      if (res?.requiresConfirmation) {
        addToast({
          type: 'info',
          title: 'Account Registered in Supabase!',
          message: 'Saved to Supabase! If email confirmation is enabled, check your inbox or sign in.'
        });
        navigate('/login');
      } else {
        addToast({
          type: 'success',
          title: 'Account Created in Supabase!',
          message: `Welcome ${formData.name}! Signed up as ${role}.`
        });
        if (role === 'shopkeeper') {
          navigate('/shopkeeper');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: err?.message || 'Failed to register account.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-coral-500 flex items-center justify-center text-white shadow-soft">
              <Sparkles className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Join StyleSync with a Customer account or register your independent Boutique as a Shopkeeper.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 sm:p-8 space-y-5">
          
          {/* Account Type Selector (Customer or Shopkeeper only - No public Admin) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'customer'
                    ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold shadow-soft ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-coral-500" />
                <span className="text-sm font-bold">Customer</span>
                <span className="text-[11px] text-slate-400 font-normal">Browse & shop fashion</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('shopkeeper')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'shopkeeper'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold shadow-soft ring-1 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Store className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold">Shopkeeper</span>
                <span className="text-[11px] text-slate-400 font-normal">Manage your boutique & stock</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* User Basics */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 234-8901"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password (Min 6 Characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Shopkeeper Specific Boutique Details */}
            {role === 'shopkeeper' && (
              <div className="pt-3 pb-1 border-t border-amber-200/60 dark:border-amber-900/40 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  <Store className="w-4 h-4" />
                  <span>Boutique Registration Details</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required={role === 'shopkeeper'}
                    placeholder="e.g. Aura Studio & Co."
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Shop Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required={role === 'shopkeeper'}
                      placeholder="e.g. 742 Evergreen Fashion Blvd, New York, NY"
                      value={formData.shopAddress}
                      onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Curated modern minimalism and sustainable street luxury."
                    value={formData.shopDescription}
                    onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Shop Logo Upload Button */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Boutique Logo
                  </label>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{logoFile ? 'Change Logo' : 'Upload Logo'}</span>
                      </button>
                      <p className="text-[11px] text-slate-400">
                        {logoFile ? logoFile.name : 'PNG, JPG, or WebP'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingLogo}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-coral-500 hover:from-brand-500 hover:to-coral-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-soft hover:scale-[1.01] transition-all"
            >
              <span>
                {loading
                  ? 'Saving to Supabase...'
                  : role === 'shopkeeper'
                  ? 'Create Shopkeeper & Boutique'
                  : 'Register Customer Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In Here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
