import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export default function ReturnRequestsPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || user?.shop?.id || '');
  const { addToast } = useToast();

  const [ordersWithRequests, setOrdersWithRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Rejected'

  // Rejection modal
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

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

  const loadRequests = async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const allOrders = await orderService.getOrders({ shopId });
      const withReqs = allOrders.filter(o => o.cancelRequest);
      setOrdersWithRequests(withReqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [shopId]);

  const handleApprove = async (order) => {
    if (window.confirm(`Approve ${order.cancelRequest.type.toLowerCase()} request for Order #${order.id}?`)) {
      try {
        setSubmittingAction(true);
        await orderService.reviewCancelRequest(order.id, 'Approve', 'Approved by boutique shopkeeper');
        addToast({
          type: 'success',
          title: 'Request Approved',
          message: `Order #${order.id} ${order.cancelRequest.type.toLowerCase()} has been approved.`
        });
        await loadRequests();
      } catch (err) {
        addToast({
          type: 'error',
          message: err.message || 'Failed to approve request.'
        });
      } finally {
        setSubmittingAction(false);
      }
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    try {
      setSubmittingAction(true);
      await orderService.reviewCancelRequest(
        rejectingOrder.id,
        'Reject',
        rejectionReason.trim() || 'Request cannot be fulfilled due to boutique policy.'
      );

      addToast({
        type: 'info',
        title: 'Request Rejected',
        message: `Order #${rejectingOrder.id} request declined.`
      });

      setRejectingOrder(null);
      setRejectionReason('');
      await loadRequests();
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to reject request.'
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filtered = ordersWithRequests.filter(o => {
    if (filter === 'all') return true;
    return o.cancelRequest?.status === filter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Customer Relations
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            24-Hour Return & Cancel Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and resolve return/cancellation requests submitted by customers within the 24-hour purchase window
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start sm:self-auto">
          {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === status
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {status === 'all' ? 'All Requests' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((order) => {
            const req = order.cancelRequest;
            const isPending = req.status === 'Pending';
            const isApproved = req.status === 'Approved';
            const isRejected = req.status === 'Rejected';

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-5 sm:p-6 space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                          Order #{order.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {req.type} Request
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {req.status}
                    </span>

                    <span className="font-display font-black text-base text-slate-900 dark:text-white">
                      ${order.total}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Reason */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  
                  {/* Customer Info */}
                  <div className="md:col-span-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Customer Details</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</p>
                    <p className="text-slate-600 dark:text-slate-400">{order.customerPhone}</p>
                    <p className="text-slate-600 dark:text-slate-400 truncate">{order.customerEmail}</p>
                  </div>

                  {/* Customer Reason */}
                  <div className="md:col-span-8 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                      Customer Stated Reason
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      "{req.reason}"
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Submitted: {new Date(req.requestedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                </div>

                {/* Rejection comment if already rejected */}
                {isRejected && req.rejectionReason && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs">
                    <span className="font-bold text-rose-900 dark:text-rose-200">Rejection Note: </span>
                    <span className="text-rose-800 dark:text-rose-300">{req.rejectionReason}</span>
                  </div>
                )}

                {/* Action Buttons for Pending requests */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setRejectingOrder(order)}
                      disabled={submittingAction}
                      className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Request</span>
                    </button>

                    <button
                      onClick={() => handleApprove(order)}
                      disabled={submittingAction}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve {req.type}</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          No return or cancel requests found under this filter.
        </div>
      )}

      {/* Reject Request Modal */}
      {rejectingOrder && (
        <Modal
          isOpen={!!rejectingOrder}
          onClose={() => setRejectingOrder(null)}
          title={`Decline Request for Order #${rejectingOrder.id}`}
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Provide a clear reason for declining this {rejectingOrder.cancelRequest?.type.toLowerCase()} request. This note will be recorded in the customer's order history.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Decline Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Garment has already been custom tailored / dispatched with courier..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shadow-soft"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
