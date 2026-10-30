import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Star, Send } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

export default function ReviewModal({ isOpen, onClose, order, onSuccess }) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast({
        type: 'warning',
        message: 'Please write a brief comment describing your experience.'
      });
      return;
    }

    try {
      setSubmitting(true);
      await orderService.submitOrderFeedback(order.id, { rating, comment });
      addToast({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Thank you! Your verified review has been recorded.'
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to submit feedback.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review Order ${order.id}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <img
            src={order.items[0]?.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=80'}
            alt="Order item"
            className="w-12 h-14 object-cover rounded-xl"
          />
          <div className="text-xs">
            <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
              {order.items[0]?.name}
              {order.items.length > 1 && ` + ${order.items.length - 1} more`}
            </p>
            <p className="text-slate-500">{order.shopName}</p>
          </div>
        </div>

        {/* Star Rating Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      active
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
              {rating === 5 ? 'Exceptional (5/5)' : `${rating}/5 Stars`}
            </span>
          </div>
        </div>

        {/* Comments input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Review Details
          </label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the fabric quality, garment fit, and packaging? Your feedback helps the artisan shop..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
