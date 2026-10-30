import { supabase, isSupabaseConfigured } from '../supabase';
import { DEFAULT_SHOP_LOGO, DEFAULT_SHOP_BANNER } from './uploadService';

export function mapSupabaseShop(s) {
  if (!s) return null;
  const logo = s.logo_url || s.logo || DEFAULT_SHOP_LOGO;
  const banner = s.banner_url || s.banner || DEFAULT_SHOP_BANNER;
  const isActive = s.is_active !== undefined ? Boolean(s.is_active) : (s.enabled !== undefined ? Boolean(s.enabled) : true);

  return {
    id: s.id,
    owner_id: s.owner_id || s.shopkeeper_id,
    ownerId: s.owner_id || s.shopkeeper_id,
    name: s.name,
    owner_name: s.owner_name || s.ownerName || 'Boutique Owner',
    ownerName: s.owner_name || s.ownerName || 'Boutique Owner',
    email: s.email || '',
    phone: s.phone || '',
    address: s.address || '',
    city: s.city || 'New York',
    state: s.state || 'NY',
    pincode: s.pincode || '10001',
    logo_url: logo,
    logo,
    banner_url: banner,
    banner,
    description: s.description || 'Exclusive fashion boutique on StyleSync.',
    is_active: isActive,
    enabled: isActive,
    rating: Number(s.rating || 5.0),
    paymentMethods: s.payment_methods || { card: true, upi: true, cod: true },
    payment_methods: s.payment_methods || { card: true, upi: true, cod: true },
    createdAt: s.created_at,
    created_at: s.created_at
  };
}

export const shopService = {
  async getShops({ search = '', status = 'all' } = {}) {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (status === 'enabled' || status === 'active') {
        query = query.eq('enabled', true);
      } else if (status === 'disabled') {
        query = query.eq('enabled', false);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`name.ilike.%${q}%,owner_name.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapSupabaseShop);
    } catch (err) {
      console.error('Supabase getShops error:', err);
      return [];
    }
  },

  async getShopById(id) {
    if (!id || !isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapSupabaseShop(data) : null;
    } catch (err) {
      console.error('Supabase getShopById error:', err);
      return null;
    }
  },

  async getShopByOwnerId(ownerId) {
    if (!ownerId || !isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('shopkeeper_id', ownerId)
        .maybeSingle();

      if (error) throw error;
      return data ? mapSupabaseShop(data) : null;
    } catch (err) {
      console.error('Supabase getShopByOwnerId error:', err);
      return null;
    }
  },

  async createShop(shopInput) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const logo = shopInput.logo || shopInput.logo_url || DEFAULT_SHOP_LOGO;
    const banner = shopInput.banner || shopInput.banner_url || DEFAULT_SHOP_BANNER;

    const payload = {
      shopkeeper_id: shopInput.shopkeeper_id || shopInput.owner_id || shopInput.ownerId || null,
      name: shopInput.name,
      owner_name: shopInput.owner_name || shopInput.ownerName || '',
      email: shopInput.email || '',
      phone: shopInput.phone || '',
      address: shopInput.address || '',
      city: shopInput.city || 'New York',
      state: shopInput.state || 'NY',
      pincode: shopInput.pincode || '10001',
      logo,
      banner,
      description: shopInput.description || 'Exclusive fashion boutique on StyleSync.',
      enabled: true,
      payment_methods: shopInput.paymentMethods || shopInput.payment_methods || { upi: true, card: true, cod: true }
    };

    const { data, error } = await supabase
      .from('shops')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseShop(data);
  },

  async updateShop(id, updates) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.owner_name !== undefined || updates.ownerName !== undefined) {
      payload.owner_name = updates.owner_name || updates.ownerName;
    }
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.pincode !== undefined) payload.pincode = updates.pincode;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.logo !== undefined || updates.logo_url !== undefined) {
      payload.logo = updates.logo || updates.logo_url;
    }
    if (updates.banner !== undefined || updates.banner_url !== undefined) {
      payload.banner = updates.banner || updates.banner_url;
    }
    if (updates.enabled !== undefined || updates.is_active !== undefined) {
      payload.enabled = updates.enabled ?? updates.is_active;
    }

    const { data, error } = await supabase
      .from('shops')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseShop(data);
  },

  async toggleShopStatus(id, newActiveState) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const currentShop = await this.getShopById(id);
    const nextState = newActiveState !== undefined ? Boolean(newActiveState) : !currentShop?.enabled;

    const { data, error } = await supabase
      .from('shops')
      .update({
        enabled: nextState
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseShop(data);
  },

  async getShopStats(shopId) {
    if (!isSupabaseConfigured()) {
      return {
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        inStockCount: 0,
        totalOrders: 0,
        ordersToday: 0,
        revenue: 0,
        pendingReturns: 0
      };
    }

    try {
      let prodsQuery = supabase.from('products').select('stock');
      let ordersQuery = supabase.from('orders').select('total, total_amount, status, created_at');

      if (shopId && shopId !== 'all') {
        prodsQuery = prodsQuery.eq('shop_id', shopId);
        ordersQuery = ordersQuery.eq('shop_id', shopId);
      }

      const [prodsRes, ordersRes] = await Promise.all([prodsQuery, ordersQuery]);
      const prods = prodsRes.data || [];
      const orders = ordersRes.data || [];

      const totalProducts = prods.length;
      const lowStockCount = prods.filter(p => p.stock > 0 && p.stock <= 5).length;
      const outOfStockCount = prods.filter(p => p.stock === 0).length;
      const inStockCount = prods.filter(p => p.stock > 5).length;

      const totalOrders = orders.length;
      const revenue = orders
        .filter(o => o.status !== 'Cancelled' && o.status !== 'Returned')
        .reduce((acc, o) => acc + (Number(o.total || o.total_amount) || 0), 0);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const ordersToday = orders.filter(o => new Date(o.created_at) >= todayStart).length;

      let pendingReturns = 0;
      let returnsQuery = supabase.from('return_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
      if (shopId && shopId !== 'all') {
        returnsQuery = returnsQuery.eq('shop_id', shopId);
      }
      const { count } = await returnsQuery;
      pendingReturns = count || 0;

      return {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        inStockCount,
        totalOrders,
        ordersToday,
        revenue,
        pendingReturns
      };
    } catch (err) {
      console.error('getShopStats error:', err);
      return {
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        inStockCount: 0,
        totalOrders: 0,
        ordersToday: 0,
        revenue: 0,
        pendingReturns: 0
      };
    }
  }
};
