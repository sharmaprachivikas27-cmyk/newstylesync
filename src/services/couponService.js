import { supabase, isSupabaseConfigured } from '../supabase';

function mapSupabaseOffer(o) {
  if (!o) return null;
  return {
    id: o.id,
    code: o.code || o.promo_code,
    description: o.description || '',
    type: o.type || 'percentage',
    value: Number(o.value || o.discount_percentage || 0),
    minOrder: Number(o.min_order || 0),
    maxDiscount: o.max_discount ? Number(o.max_discount) : undefined,
    expiresAt: o.expires_at || o.valid_until,
    shopId: o.shop_id || 'all',
    isActive: Boolean(o.is_active)
  };
}

export const couponService = {
  async getOffers({ shopId = 'all' } = {}) {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('offers').select('*').eq('is_active', true);
      if (shopId && shopId !== 'all') {
        query = query.or(`shop_id.is.null,shop_id.eq.${shopId}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapSupabaseOffer);
    } catch (err) {
      console.error('Supabase getOffers error:', err);
      return [];
    }
  },

  async createOffer(offerInput) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const cleanCode = (offerInput.code || offerInput.promo_code || '').toUpperCase().trim();
    const payload = {
      code: cleanCode,
      promo_code: cleanCode,
      title: offerInput.title || cleanCode,
      description: offerInput.description || '',
      type: offerInput.type || 'percentage',
      value: Number(offerInput.value) || 0,
      discount_percentage: Number(offerInput.value) || 10,
      min_order: Number(offerInput.minOrder) || 0,
      max_discount: offerInput.maxDiscount ? Number(offerInput.maxDiscount) : null,
      expires_at: offerInput.expiresAt,
      valid_until: offerInput.expiresAt,
      shop_id: offerInput.shopId && offerInput.shopId !== 'all' ? offerInput.shopId : null,
      is_active: true
    };

    const { data, error } = await supabase.from('offers').insert([payload]).select().single();
    if (error) throw error;
    return mapSupabaseOffer(data);
  },

  async deleteOffer(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async validateCoupon(code, subtotal, shopId) {
    if (!code || !code.trim()) {
      return { valid: false, message: 'Please enter a coupon code' };
    }

    const offers = await this.getOffers({ shopId });
    const coupon = offers.find(
      o => (o.code || '').toUpperCase() === code.trim().toUpperCase() && o.isActive
    );

    if (!coupon) {
      return { valid: false, message: 'Invalid or inactive coupon code' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return { valid: false, message: 'This coupon has expired' };
    }

    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        message: `Minimum order of $${coupon.minOrder} required for this coupon`
      };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.value, subtotal);
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon "${coupon.code}" applied successfully!`
    };
  }
};
