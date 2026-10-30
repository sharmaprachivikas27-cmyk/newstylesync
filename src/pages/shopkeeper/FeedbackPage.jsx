import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquare, ThumbsUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || '');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveShop() {
      if (user?.id) {
        const myShop = await shopService.getShopByOwnerId(user.id);
        if (myShop) {
          setShopId(myShop.id);
          return;
        }
      }
      if (user?.shopId) {
        setShopId(user.shopId);
      }
    }
    resolveShop();
  }, [user]);

  useEffect(() => {
    async function loadFeedback() {
      if (!shopId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orders = await orderService.getOrders({ shopId });
        const reviewedOrders = orders
          .filter(o => o.reviewSubmitted && o.reviewData)
          .map(o => ({
            id: `rev-${o.id}`,
            orderId: o.id,
            customerName: o.customerName || 'Customer',
            rating: o.reviewData.rating,
            comment: o.reviewData.comment,
            createdAt: o.reviewData.createdAt,
            items: o.items
          }));

        setReviews(reviewedOrders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [shopId]);

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
    : '5.00';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Reputation & Ratings
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Customer Feedback & Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings and critique from buyers who received delivered boutique orders in Supabase
          </p>
        </div>
      </div>

      {/* Ratings Aggregate Score Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Overall Rating
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl text-slate-900 dark:text-white">
              {avgRating}
            </span>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Based on {reviews.length} buyer reviews
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Review Count
          </p>
          <p className="font-display font-black text-4xl text-slate-900 dark:text-white">
            {reviews.length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Delivered Purchases
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Five-Star Ratio
          </p>
          <p className="font-display font-black text-4xl text-slate-900 dark:text-white">
            {reviews.length
              ? `${Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100)}%`
              : '100%'}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Customer satisfaction score
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Buyer Feedback Log
        </h3>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading reviews from Supabase...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No customer reviews submitted for this boutique yet. Once buyers receive and review orders, their critique will appear here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {r.customerName}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      (Order #{r.orderId})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{r.comment}"
                </p>

                {r.items && r.items.length > 0 && (
                  <p className="text-[11px] text-slate-400 italic">
                    Purchased: {r.items.map(it => it.name).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
