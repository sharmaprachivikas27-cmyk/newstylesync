import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/common/OrderTimeline';
import Modal from '../../components/common/Modal';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check
} from 'lucide-react';

const ORDER_STATUS_FLOW = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function ShopOrdersPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || user?.shop?.id || '');
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});

  // Status update modal state
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  useEffect(() => {
    async function resolveShop() {
      if (user?.shopId) {
        setShopId(user.shopId);
        return;
      }
      if (user?.shop?.id) {
        setShopId(user.shop.id);
        return;
      }
      if (user?.id) {
        try {
          const myShop = await shopService.getShopByOwnerId(user.id);
          if (myShop) {
            setShopId(myShop.id);
            return;
          }
        } catch (e) {
          console.error('Error resolving shop:', e);
        }
      }
    }
    resolveShop();
  }, [user]);

  const loadOrders = async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const list = await orderService.getOrders({
        shopId,
        status: statusFilter,
        search
      });
      setOrders(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [shopId, statusFilter, search]);

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openStatusModal = (order) => {
    setUpdatingOrder(order);
    // Suggest the next logical step in the pipeline
    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
    const nextStep = currentIndex < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[currentIndex + 1] : order.status;
    setNewStatus(nextStep);
    setStatusNote('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingOrder) return;

    try {
      setSubmittingStatus(true);
      await orderService.updateOrderStatus(updatingOrder.id, newStatus, statusNote);
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order #${updatingOrder.id} status changed to ${newStatus}.`
      });
      setUpdatingOrder(null);
      await loadOrders();
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to update order status.'
      });
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Fulfillment Center
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Boutique Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process orders, advance lifecycle tracking status, and verify delivery milestones
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {['all', 'Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const isTerminal = order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Returned';
            const windowCheck = orderService.checkCancellationWindow(order.createdAt);

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden"
              >
                {/* Order Header Row */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/40 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {order.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {order.status}
                    </span>
                    {order.cancelRequest && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                        {order.cancelRequest.type} {order.cancelRequest.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">${order.total}</p>
                      <p className="text-[10px] text-slate-400">{order.paymentMethod} • {order.paymentStatus}</p>
                    </div>

                    {!isTerminal && (
                      <button
                        onClick={() => openStatusModal(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Status</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Customer */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Recipient</span>
                      <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                      <p className="text-slate-500">{order.customerPhone}</p>
                      <p className="text-slate-500 truncate">{order.customerEmail}</p>
                    </div>

                    {/* Shipping Address */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Delivery Destination</span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                      </p>
                    </div>

                    {/* 24-Hour Policy Window status */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Customer Return Window</span>
                      {windowCheck.isAllowed ? (
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {windowCheck.formatted} remaining
                        </p>
                      ) : (
                        <p className="text-slate-500">24-hour return window closed</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <img src={it.image} alt="" className="w-5 h-6 rounded object-cover" />
                        <span>{it.name} (Qty {it.quantity}, {it.size})</span>
                      </span>
                    ))}
                  </div>

                  {/* Expanded Timeline */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                      <OrderTimeline status={order.status} timeline={order.timeline} />
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          No orders found matching the filter.
        </div>
      )}

      {/* Update Order Status Modal */}
      {updatingOrder && (
        <Modal
          isOpen={!!updatingOrder}
          onClose={() => setUpdatingOrder(null)}
          title={`Update Fulfillment: Order #${updatingOrder.id}`}
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                New Tracking Milestone *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
              >
                {ORDER_STATUS_FLOW.map((step) => (
                  <option key={step} value={step}>
                    {step} {step === updatingOrder.status ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Tracking Note / Courier Info
              </label>
              <input
                type="text"
                placeholder="e.g. Dispatched via DHL Express #DHL-98421 or Quality checked & ironed"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUpdatingOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingStatus}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{submittingStatus ? 'Updating...' : 'Save & Notify Customer'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
