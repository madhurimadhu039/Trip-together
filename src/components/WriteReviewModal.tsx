import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { PlatformReviewItem } from '../types';

const isStaticHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { hostname, protocol } = window.location;
  if (protocol === 'file:') return true;
  if (hostname.endsWith('.github.io')) return true;
  if (hostname.endsWith('.vercel.app')) return true;
  if (hostname.endsWith('.netlify.app')) return true;
  return false;
};

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReview: PlatformReviewItem) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultName = '',
}) => {
  if (!isOpen) return null;

  const [authorName, setAuthorName] = useState(defaultName || '');
  const [location, setLocation] = useState('');
  const [targetType, setTargetType] = useState<'platform' | 'destination' | 'package' | 'guide'>('platform');
  const [targetTitle, setTargetTitle] = useState('Trip Together Platform');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedReview, setSubmittedReview] = useState<PlatformReviewItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setError('Please provide your review thoughts (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // On static hosts (GitHub Pages / Vercel static) there is no API server
      if (isStaticHost()) {
        const localReview: PlatformReviewItem = {
          id: `rev-${Date.now()}`,
          authorName: authorName.trim(),
          location: location.trim() || 'Verified Traveler',
          targetType,
          targetTitle: targetTitle.trim() || 'Trip Together Platform',
          rating,
          comment: comment.trim(),
          date: new Date().toISOString().split('T')[0],
          verified: true,
        } as any;
        setSubmittedReview(localReview);
        onSuccess(localReview);
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          location: location.trim() || 'Verified Traveler',
          targetType,
          targetTitle: targetTitle.trim() || 'Trip Together Platform',
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.review) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmittedReview(data.review);
      onSuccess(data.review);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#0F1E36] to-[#0D9488] text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300">
              <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-display">Share Your Travel Experience</h2>
              <p className="text-xs text-stone-200 mt-0.5">
                Leave a verified review to help fellow travellers plan authentic journeys.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedReview ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif-display">
                Thank You for Your Review!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Your feedback has been recorded and published on the Trip Together verified feedback board.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating === 5
                      ? '5/5 Excellent'
                      : rating === 4
                      ? '4/5 Very Good'
                      : rating === 3
                      ? '3/5 Good'
                      : rating === 2
                      ? '2/5 Fair'
                      : '1/5 Poor'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Madhuri Rao"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your City / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hyderabad, AP"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Review Target</label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setTargetType(t);
                      if (t === 'platform') setTargetTitle('Trip Together Platform');
                      else if (t === 'destination') setTargetTitle('Tirupati Pilgrimage Circuit');
                      else if (t === 'package') setTargetTitle('Sacred Darshan Tour Package');
                      else setTargetTitle('Local Certified Tour Guide');
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="platform">Platform Overall Experience</option>
                    <option value="destination">Specific Destination</option>
                    <option value="package">Tour Package</option>
                    <option value="guide">Local Guide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Name / Subject</label>
                  <input
                    type="text"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder="Subject title..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback & Review *</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about punctuality, family comfort, transparent pricing, darshan assistance, or itinerary usefulness..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post Verified Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
