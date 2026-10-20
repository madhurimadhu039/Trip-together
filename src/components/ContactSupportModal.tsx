import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import type { ContactTicketItem } from '../types';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  defaultName = '',
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(defaultName || '');
  const [email, setEmail] = useState(defaultEmail || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Trip Planning & Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedTicket, setConfirmedTicket] = useState<ContactTicketItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please provide message details (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || category,
          category,
          message: message.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ticket) {
        throw new Error(data.error || 'Failed to submit contact request');
      }

      setConfirmedTicket(data.ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#0F1E36] via-[#1E3A8A] to-[#0D9488] text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-teal-300">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-teal-300" />
                <span>24/7 Platform Concierge</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-display">Contact Trip Together</h2>
              <p className="text-xs text-stone-200 mt-0.5">
                Have questions regarding custom itineraries, packages, local guides, or bookings? We are here to help.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {confirmedTicket ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif-display">
                Message Received!
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{confirmedTicket.name}</strong>. Your inquiry has been registered in our support desk.
              </p>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl max-w-md mx-auto text-left text-xs text-slate-700 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                  <span className="font-semibold text-stone-500">Ticket Reference:</span>
                  <span className="font-mono-num font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md">
                    {confirmedTicket.ticketRef}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-500">Subject:</span>
                  <span className="font-medium text-slate-900">{confirmedTicket.subject}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-500">Expected Response:</span>
                  <span className="font-medium text-emerald-800">Within 4 Business Hours</span>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Close & Continue Planning
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Direct Info */}
              <div className="md:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 font-serif-display uppercase tracking-wider">
                  Direct Assistance
                </h3>

                <div className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#0D9488] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Email Desk</div>
                      <a href="mailto:support@triptogether.com" className="text-[#0D9488] hover:underline">
                        support@triptogether.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#0D9488] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Helpline</div>
                      <div className="font-mono-num">+91 1800-425-TRIP (Toll-Free)</div>
                      <div className="text-[11px] text-stone-400">Mon–Sat 9:00 AM – 8:00 PM IST</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#0D9488] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Emergency On-Trip Support</div>
                      <div className="text-emerald-700 font-semibold">24/7 WhatsApp Assistance</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 leading-relaxed">
                    Trip Together is a transparent travel facilitation engine. For train ticket cancellations or official TTD darshan quota inquiries, official government portals take precedence.
                  </div>
                </div>
              </div>

              {/* Right Column: Ticket Submission Form */}
              <div className="md:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                      >
                        <option value="Trip Planning & Inquiry">Trip Planning & Inquiry</option>
                        <option value="Tour Package Booking">Tour Package Booking</option>
                        <option value="Local Guide Question">Local Guide Question</option>
                        <option value="Payment & Tariff Transparency">Payment & Tariff Transparency</option>
                        <option value="Platform Feedback & Bugs">Platform Feedback & Bugs</option>
                        <option value="Guide Partnership Application">Guide Partnership Application</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message / Question *</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please let us know how our team can help your family travel journey..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
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
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Support Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
