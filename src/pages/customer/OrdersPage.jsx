import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/common/OrderTimeline';
import ReviewModal from '../../components/customer/ReviewModal';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Package,
  Clock,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Send,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [expandedOrders, setExpandedOrders] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Modal states
  const [reviewOrder, setReviewOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelType, setCancelType] = useState('Cancel');
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Live 1-second interval to tick the 24-hour countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Fetch customer orders scoped to current logged-in user
      const list = await orderService.getOrders(user?.id ? { customerId: user.id } : {});
      setOrders(list);
      // Default first order expanded
      if (list.length > 0 && Object.keys(expandedOrders).length === 0) {
        setExpandedOrders({ [list[0].id]: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelType(order.status === 'Delivered' ? 'Return' : 'Cancel');
    setCancelReason('');
  };

  const handleSubmitCancelRequest = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      addToast({
        type: 'warning',
        message: 'Please provide a brief reason for your request.'
      });
      return;
    }

    try {
      setSubmittingCancel(true);
      await orderService.submitCancelOrReturnRequest(cancelModalOrder.id, {
        type: cancelType,
        reason: cancelReason
      });

      addToast({
        type: 'success',
        title: 'Request Submitted',
        message: `Your ${cancelType.toLowerCase()} request has been sent to the shopkeeper for review.`
      });

      setCancelModalOrder(null);
      await loadOrders();
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to submit request.'
      });
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Filter tab logic
  const filteredOrders = orders.filter(o => {
    if (filterTab === 'active') {
      return ['Placed', 'Confirmed', 'Packed', 'Shipped'].includes(o.status);
    }
    if (filterTab === 'delivered') {
      return o.status === 'Delivered';
    }
    if (filterTab === 'cancelled') {
      return o.status === 'Cancelled' || o.status === 'Returned';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-coral-500">
            Real-Time Lifecycle Tracking
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white mt-1">
            My Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track visual delivery milestones, request 24h cancellations, and leave artisan feedback
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled/Returns' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === tab.id
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const isExpanded = !!expandedOrders[order.id];
            const windowCheck = orderService.checkCancellationWindow(order.createdAt);
            const isDelivered = order.status === 'Delivered';
            const isCancelledOrReturned = order.status === 'Cancelled' || order.status === 'Returned';
            const hasPendingRequest = order.cancelRequest && order.cancelRequest.status === 'Pending';
            const hasApprovedRequest = order.cancelRequest && order.cancelRequest.status === 'Approved';
            const hasRejectedRequest = order.cancelRequest && order.cancelRequest.status === 'Rejected';

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden transition-all duration-200"
              >
                {/* Order Summary Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Reference</span>
                      <p className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                        {order.id}
                      </p>
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Placed On</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

                    <div className="hidden md:block">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Boutique</span>
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {order.shopName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : isCancelledOrReturned
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                      }`}
                    >
                      {order.status}
                    </span>

                    <span className="font-display font-black text-base text-slate-900 dark:text-white">
                      ${order.total}
                    </span>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title={isExpanded ? 'Collapse order' : 'Expand order timeline'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  
                  {/* Items preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=80'}
                          alt={item.name}
                          className="w-12 h-14 object-cover rounded-xl shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Size: {item.size} • {item.color}
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                            ${item.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 24-HOUR COUNTDOWN & CANCELLATION/RETURN WINDOW CONTROLS */}
                  {!isCancelledOrReturned && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-coral-50/50 dark:from-brand-950/40 dark:to-coral-950/20 border border-brand-200/80 dark:border-brand-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Window timer & status */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm shrink-0">
                          <Clock className="w-5 h-5 text-coral-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                              24-Hour Cancellation & Return Window
                            </h4>
                            {windowCheck.isAllowed ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold animate-pulse">
                                Live
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                Expired
                              </span>
                            )}
                          </div>

                          {windowCheck.isAllowed ? (
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                              Countdown:{' '}
                              <strong className="font-mono text-brand-600 dark:text-coral-400 font-extrabold">
                                {windowCheck.formatted}
                              </strong>{' '}
                              remaining to request return or cancellation.
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-0.5">
                              The 24-hour instant cancel/return window for this order has concluded.
                            </p>
                          )}

                          {/* Existing request status callout */}
                          {hasPendingRequest && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{order.cancelRequest.type} Request Pending Shopkeeper Review</span>
                            </div>
                          )}

                          {hasRejectedRequest && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Request Declined: {order.cancelRequest.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Request Action button (visible ONLY within 24 hours & if no pending request) */}
                      {windowCheck.isAllowed && !hasPendingRequest && (
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/80 shadow-soft flex items-center justify-center gap-1.5 shrink-0 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-coral-500" />
                          <span>Request {isDelivered ? 'Return' : 'Cancel'}</span>
                        </button>
                      )}

                    </div>
                  )}

                  {/* Feedback / Rating Section for Delivered Orders */}
                  {isDelivered && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Delivery Complete</span>
                        </div>

                        {order.reviewSubmitted ? (
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {Array.from({ length: order.reviewData?.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 italic">
                              "{order.reviewData?.comment}"
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            How did the garment fit and feel? Share verified feedback for the boutique.
                          </p>
                        )}
                      </div>

                      {!order.reviewSubmitted && (
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Rate & Review Order</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expanded Visual Tracking Timeline */}
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
        <EmptyState
          icon={Package}
          title="No Orders in this View"
          description="You don't have any orders matching the selected filter tab."
          actionText="Shop Now"
          actionLink="/products"
        />
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          order={reviewOrder}
          onSuccess={loadOrders}
        />
      )}

      {/* 24-Hour Cancel / Return Request Modal */}
      {cancelModalOrder && (
        <Modal
          isOpen={!!cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          title={`Request ${cancelType} for Order #${cancelModalOrder.id}`}
        >
          <form onSubmit={handleSubmitCancelRequest} className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  24-Hour Window Verification Passed
                </p>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  Your request is submitted within the allowed 24-hour policy. The boutique shopkeeper ({cancelModalOrder.shopName}) will review and approve your return or cancellation.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Request Type
              </label>
              <select
                value={cancelType}
                onChange={(e) => setCancelType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Cancel">Cancel Order (Before Dispatch)</option>
                <option value="Return">Return Order (Exchange or Refund)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Reason for Request *
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered incorrect size, changed mind on colorway, or expedited shipping no longer needed..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={submittingCancel}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingCancel ? 'Submitting...' : 'Send Request'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
