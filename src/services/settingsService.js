import { supabase, isSupabaseConfigured } from '../supabase';

const DEFAULT_METHODS = { upi: true, card: true, cod: true };

export const settingsService = {
  async getPaymentSettings(shopId) {
    if (!shopId || !isSupabaseConfigured()) {
      return DEFAULT_METHODS;
    }

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('payment_methods')
        .eq('id', shopId)
        .maybeSingle();

      if (!error && data?.payment_methods) {
        return data.payment_methods;
      }
    } catch (err) {
      console.warn('Supabase getPaymentSettings notice:', err.message);
    }

    return DEFAULT_METHODS;
  },

  async updatePaymentSettings(shopId, paymentMethods) {
    if (!shopId || !isSupabaseConfigured()) throw new Error('Shop ID or Supabase missing');

    const { data, error } = await supabase
      .from('shops')
      .update({ payment_methods: paymentMethods })
      .eq('id', shopId)
      .select('payment_methods')
      .single();

    if (error) throw error;
    return data?.payment_methods || paymentMethods;
  }
};
