import { supabase, isSupabaseConfigured } from '../supabase';
import { DEFAULT_PRODUCT_IMAGE } from './uploadService';

export function mapSupabaseProduct(p) {
  if (!p) return null;
  const imgs = (p.image_urls && p.image_urls.length > 0)
    ? p.image_urls
    : (p.images && p.images.length > 0 ? p.images : [DEFAULT_PRODUCT_IMAGE]);

  return {
    id: p.id,
    name: p.name,
    shopId: p.shop_id,
    shop_id: p.shop_id,
    shopName: p.shops?.name || 'Curated Boutique',
    category: p.category || 'Women',
    price: Number(p.price || 0),
    originalPrice: p.original_price ? Number(p.original_price) : Number(p.price || 0),
    original_price: p.original_price ? Number(p.original_price) : Number(p.price || 0),
    stock: Number(p.stock !== undefined ? p.stock : 0),
    sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L'],
    colors: Array.isArray(p.colors) ? p.colors : [],
    images: imgs,
    image_urls: imgs,
    description: p.description || '',
    fabric: p.fabric || '',
    care: p.care || '',
    rating: Number(p.rating || 5.0),
    reviewsCount: Number(p.reviews_count || 0),
    isFeatured: Boolean(p.is_featured),
    isNew: Boolean(p.is_new),
    isActive: p.is_active !== undefined ? Boolean(p.is_active) : true,
    createdAt: p.created_at,
    created_at: p.created_at
  };
}

export const productService = {
  async getProducts(params = {}) {
    const {
      search = '',
      category = 'All',
      shopId = 'all',
      minPrice = 0,
      maxPrice = 10000,
      size = '',
      color = '',
      sortBy = 'featured',
      inStockOnly = false
    } = params;

    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('products')
        .select('*, shops(name, enabled)');

      if (shopId && shopId !== 'all') {
        query = query.eq('shop_id', shopId);
      }

      if (category && category !== 'All') {
        query = query.ilike('category', category);
      }

      if (minPrice > 0) {
        query = query.gte('price', minPrice);
      }

      if (maxPrice < 10000) {
        query = query.lte('price', maxPrice);
      }

      if (inStockOnly) {
        query = query.gt('stock', 0);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
      }

      // Sorting
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      let mapped = (data || []).map(mapSupabaseProduct);

      if (size) {
        mapped = mapped.filter(p => p.sizes && p.sizes.includes(size));
      }
      if (color) {
        mapped = mapped.filter(p =>
          p.colors && p.colors.some(c => (c.name || '').toLowerCase() === color.toLowerCase())
        );
      }

      return mapped;
    } catch (err) {
      console.error('Supabase getProducts error:', err);
      return [];
    }
  },

  async getProductById(id) {
    if (!id || !isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(name, is_active, enabled)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapSupabaseProduct(data) : null;
    } catch (err) {
      console.error('Supabase getProductById error:', err);
      return null;
    }
  },

  async createProduct(productInput) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const imgs = productInput.images && productInput.images.length > 0
      ? productInput.images
      : (productInput.image_urls && productInput.image_urls.length > 0 ? productInput.image_urls : [DEFAULT_PRODUCT_IMAGE]);

    const payload = {
      name: productInput.name,
      shop_id: productInput.shopId || productInput.shop_id,
      category: productInput.category || 'Women',
      price: Number(productInput.price) || 0,
      original_price: Number(productInput.originalPrice || productInput.price || 0),
      stock: Number(productInput.stock) || 0,
      sizes: productInput.sizes || ['S', 'M', 'L'],
      colors: productInput.colors || [{ name: 'Classic Black', hex: '#18181b' }],
      images: imgs,
      description: productInput.description || '',
      fabric: productInput.fabric || 'Premium Sustainable Fabric',
      care: productInput.care || 'Gentle wash or specialist dry clean.',
      is_featured: !!productInput.isFeatured,
      is_new: true
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select('*, shops(name)')
      .single();

    if (error) throw error;
    return mapSupabaseProduct(data);
  },

  async updateProduct(id, updates) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.originalPrice !== undefined) payload.original_price = Number(updates.originalPrice);
    if (updates.stock !== undefined) payload.stock = Number(updates.stock);
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.colors !== undefined) payload.colors = updates.colors;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.fabric !== undefined) payload.fabric = updates.fabric;
    if (updates.care !== undefined) payload.care = updates.care;
    if (updates.isFeatured !== undefined) payload.is_featured = Boolean(updates.isFeatured);
    if (updates.images !== undefined || updates.image_urls !== undefined) {
      payload.images = updates.images || updates.image_urls;
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('*, shops(name)')
      .single();

    if (error) throw error;
    return mapSupabaseProduct(data);
  },

  async deleteProduct(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async getCategories() {
    return ['All', 'Women', 'Men', 'Outerwear', 'Streetwear', 'Formal', 'Accessories'];
  }
};
