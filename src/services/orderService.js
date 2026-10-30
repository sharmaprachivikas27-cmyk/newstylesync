import { supabase, isSupabaseConfigured } from '../supabase';

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms

const isValidUuid = (val) =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export function mapSupabaseOrder(o) {
  if (!o) return null;

  // Format return request if joined
  const cancelReq = o.return_requests && o.return_requests.length > 0 ? {
    type: o.return_requests[0].type || 'Cancel',
    reason: o.return_requests[0].reason,
    status: o.return_requests[0].status,
    rejectionReason: o.return_requests[0].rejection_reason,
    requestedAt: o.return_requests[0].created_at
  } : (o.cancelRequest || null);

  // Format feedback if joined
  const feedbackData = o.feedback && o.feedback.length > 0 ? {
    rating: o.feedback[0].rating,
    comment: o.feedback[0].comment,
    createdAt: o.feedback[0].created_at
  } : (o.reviewData || null);

  return {
    id: o.id,
    customerId: o.customer_id || o.user_id,
    customer_id: o.customer_id || o.user_id,
    customerName: o.customer_name || 'Customer',
    customerEmail: o.customer_email || '',
    customerPhone: o.customer_phone || '',
    shopId: o.shop_id,
    shop_id: o.shop_id,
    shopName: o.shops?.name || 'Exclusive Boutique',
    createdAt: o.created_at,
    created_at: o.created_at,
    items: (o.order_items || []).map(it => ({
      productId: it.product_id,
      name: it.name,
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      size: it.size || 'M',
      color: it.color || 'Default',
      image: it.image_url || it.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80'
    })),
    subtotal: Number(o.subtotal || o.total_amount || 0),
    discount: Number(o.discount || 0),
    shippingFee: Number(o.shipping_fee || 0),
    total: Number(o.total || o.total_amount || 0),
    total_amount: Number(o.total || o.total_amount || 0),
    paymentMethod: o.payment_method || 'Card',
    paymentStatus: o.payment_status || 'Paid',
    shippingAddress: o.shipping_address || {},
    status: o.status || 'Placed',
    timeline: Array.isArray(o.timeline) ? o.timeline : [],
    cancelRequest: cancelReq,
    reviewSubmitted: Boolean(feedbackData || o.reviewSubmitted),
    reviewData: feedbackData
  };
}

export const orderService = {
  checkCancellationWindow(createdAt) {
    if (!createdAt) {
      return { isAllowed: false, remainingMs: 0, hours: 0, minutes: 0, seconds: 0, formatted: '00:00:00' };
    }

    const placedTime = new Date(createdAt).getTime();
    const elapsed = Date.now() - placedTime;
    const remainingMs = CANCELLATION_WINDOW_MS - elapsed;

    if (remainingMs <= 0) {
      return {
        isAllowed: false,
        remainingMs: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: 'Window Closed'
      };
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

    return {
      isAllowed: true,
      remainingMs,
      hours,
      minutes,
      seconds,
      formatted
    };
  },

  async getOrders({ customerId, shopId, status = 'all', search = '' } = {}) {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase
        .from('orders')
        .select('*, shops(name), order_items(*), return_requests(*), feedback(*)')
        .order('created_at', { ascending: false });

      if (customerId && isValidUuid(customerId)) {
        query = query.eq('customer_id', customerId);
      }

      if (shopId && shopId !== 'all') {
        query = query.eq('shop_id', shopId);
      }

      if (status && status !== 'all') {
        query = query.ilike('status', status);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`id.ilike.%${q}%,customer_name.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapSupabaseOrder);
    } catch (err) {
      console.error('Supabase getOrders error:', err);
      return [];
    }
  },

  async getOrderById(id) {
    if (!id || !isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, shops(name), order_items(*), return_requests(*), feedback(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapSupabaseOrder(data) : null;
    } catch (err) {
      console.error('Supabase getOrderById error:', err);
      return null;
    }
  },

  async createOrder(orderInput) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const nowIso = new Date().toISOString();
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const validCustId = isValidUuid(orderInput.customerId) ? orderInput.customerId : null;
    const validShopId = isValidUuid(orderInput.shopId) ? orderInput.shopId : null;

    const totalVal = Number(orderInput.total) || 0;

    const orderPayload = {
      id: orderNumber,
      customer_id: validCustId,
      customer_name: orderInput.customerName || 'Customer',
      customer_email: orderInput.customerEmail || '',
      customer_phone: orderInput.customerPhone || '',
      shop_id: validShopId,
      subtotal: Number(orderInput.subtotal) || 0,
      discount: Number(orderInput.discount) || 0,
      shipping_fee: Number(orderInput.shippingFee) || 0,
      total: totalVal,
      payment_method: orderInput.paymentMethod || 'Card',
      payment_status: orderInput.paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Paid',
      shipping_address: orderInput.shippingAddress || {},
      status: 'Placed',
      timeline: [
        {
          status: 'Placed',
          timestamp: nowIso,
          note: `Order placed via ${orderInput.paymentMethod || 'Card'}`
        }
      ]
    };

    let createdOrder = null;
    const { data, error: orderErr } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .maybeSingle();

    if (orderErr) {
      // Fallback: try raw insert if RLS policy blocked the returning SELECT
      const { error: insErr } = await supabase
        .from('orders')
        .insert([orderPayload]);
      if (insErr) throw insErr;
    } else {
      createdOrder = data;
    }

    // Insert order items
    if (orderInput.items && orderInput.items.length) {
      const itemsPayload = orderInput.items.map(it => ({
        order_id: orderNumber,
        product_id: isValidUuid(it.productId) ? it.productId : null,
        name: it.name,
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        size: it.size || 'M',
        color: it.color || 'Default',
        image: it.image || it.image_url || ''
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsErr) console.warn('Order items insert notice:', itemsErr);

      // Decrement product stock in Supabase
      for (const it of orderInput.items) {
        if (isValidUuid(it.productId)) {
          try {
            const { data: p } = await supabase
              .from('products')
              .select('stock')
              .eq('id', it.productId)
              .single();
            if (p) {
              const newStock = Math.max(0, (p.stock || 0) - it.quantity);
              await supabase.from('products').update({ stock: newStock }).eq('id', it.productId);
            }
          } catch (e) {
            console.warn('Stock update note:', e);
          }
        }
      }
    }

    const fullOrder = await this.getOrderById(orderNumber);
    return fullOrder || mapSupabaseOrder(createdOrder || { ...orderPayload, created_at: nowIso });
  },

  async updateOrderStatus(orderId, newStatus, note = '') {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const current = await this.getOrderById(orderId);
    const updatedTimeline = current?.timeline ? [...current.timeline] : [];
    updatedTimeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order updated to ${newStatus}`
    });

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        timeline: updatedTimeline
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseOrder(data);
  },

  async submitCancelOrReturnRequest(orderId, { type = 'Cancel', reason = '' }) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const windowCheck = this.checkCancellationWindow(order.createdAt);
    if (!windowCheck.isAllowed) {
      throw new Error('Cancellation or return window has expired (allowed within 24 hours of order only).');
    }

    const validCustId = isValidUuid(order.customerId) ? order.customerId : null;
    const validShopId = isValidUuid(order.shopId) ? order.shopId : null;

    const { error: reqErr } = await supabase
      .from('return_requests')
      .insert([
        {
          order_id: orderId,
          user_id: validCustId,
          customer_id: validCustId,
          shop_id: validShopId,
          reason,
          type,
          status: 'Pending'
        }
      ]);

    if (reqErr) throw reqErr;

    // Update order status
    const newStatus = type === 'Return' ? 'Return Requested' : 'Cancellation Requested';
    await this.updateOrderStatus(orderId, newStatus, `Customer requested ${type}: "${reason}"`);

    return this.getOrderById(orderId);
  },

  async resolveReturnRequest(orderId, approved, rejectionReason = '') {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const newReqStatus = approved ? 'Approved' : 'Rejected';
    await supabase
      .from('return_requests')
      .update({
        status: newReqStatus,
        rejection_reason: approved ? null : rejectionReason
      })
      .eq('order_id', orderId);

    const nextOrderStatus = approved ? 'Cancelled' : 'Processing';
    const note = approved
      ? 'Shopkeeper approved cancellation/return request'
      : `Shopkeeper rejected request: ${rejectionReason}`;

    return this.updateOrderStatus(orderId, nextOrderStatus, note);
  },

  async submitReview(orderId, { productId, shopId, rating, comment, customerId }) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const validCustId = isValidUuid(customerId) ? customerId : null;
    const validShopId = isValidUuid(shopId) ? shopId : null;
    const validProdId = isValidUuid(productId) ? productId : null;

    const { error } = await supabase
      .from('feedback')
      .insert([
        {
          order_id: orderId,
          product_id: validProdId,
          shop_id: validShopId,
          user_id: validCustId,
          rating: Number(rating) || 5,
          comment: comment || ''
        }
      ]);

    if (error) throw error;
    return true;
  }
};
