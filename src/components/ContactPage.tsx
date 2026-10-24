import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  HelpCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ContactPageProps {
  defaultEmail?: string;
  defaultName?: string;
  onNavigateHome?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  defaultEmail = '',
  defaultName = '',
  onNavigateHome,
}) => {
  const [name, setName] = useState(defaultName || '');
  const [email, setEmail] = useState(defaultEmail || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Trip Planning & Inquiry');
  const [message, setMessage] = useState('');
  const [botHoneypot, setBotHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<{
    success: boolean;
    emailDelivered: boolean;
    ticketRef: string;
    recipient?: string;
    message?: string;
    errorNote?: string;
  } | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent accidental rapid duplicate submissions (5 second cooldown)
    const now = Date.now();
    if (now - lastSubmitTime < 5000) {
      setError('Please wait a moment before submitting again.');
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please provide message details (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setLastSubmitTime(now);

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
          botField: botHoneypot,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.emailDelivered) {
        // Real email delivery confirmed by the backend email service
        setDeliveryResult({
          success: true,
          emailDelivered: true,
          ticketRef: data.ticket?.ticketRef || `TKT-${Date.now().toString(36).toUpperCase()}`,
          recipient: data.recipient || 'madhurimadhu039@gmail.com',
          message: data.message || 'Your inquiry has been successfully delivered.',
        });
      } else if (data?.ticket) {
        // Backend received and created ticket, but email service failed or unconfigured
        setDeliveryResult({
          success: false,
          emailDelivered: false,
          ticketRef: data.ticket.ticketRef,
          recipient: data.recipient || 'madhurimadhu039@gmail.com',
          errorNote: data.error || 'Server recorded your inquiry, but real email delivery is not configured on this host.',
        });
      } else {
        // Static host or backend unavailable
        throw new Error(
          data?.error ||
          'Email delivery service is currently unavailable. You can reach our team directly at madhurimadhu039@gmail.com.'
        );
      }
    } catch (err: any) {
      // Per instructions: NEVER claim email was delivered if it failed
      setError(err.message || 'Failed to send message. Please contact us directly via email.');
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoFallbackUrl = `mailto:madhurimadhu039@gmail.com?subject=${encodeURIComponent(
    `[Trip Together] ${category}: ${subject || 'Inquiry'}`
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}`
  )}`;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500">
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-[#0D9488] transition-colors cursor-pointer font-semibold"
        >
          Home
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800 font-semibold" aria-current="page">Contact Us</span>
      </nav>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D9488] text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support & Direct Inquiry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display">
          Contact Trip Together
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Have questions about your trip plan, tour packages, or local guides? Reach our team and we'll assist you promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info & Support Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0D9488] rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-6">
            <div>
              <h2 className="text-lg font-bold font-serif-display">Direct Assistance</h2>
              <p className="text-xs text-stone-200 mt-1">
                Official communication channels for travelers, local guides, and partners.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-stone-200 text-xs mb-0.5">Official Support Email</div>
                  <a
                    href="mailto:madhurimadhu039@gmail.com"
                    className="text-teal-200 hover:text-white underline break-all font-mono-num text-xs"
                  >
                    madhurimadhu039@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-200 text-xs mb-0.5">Toll-Free Traveler Helpline</div>
                  <div className="text-xs font-mono-num font-semibold text-white">+91 1800-425-TRIP</div>
                  <div className="text-[11px] text-stone-300 mt-0.5">Mon–Sat: 9:00 AM – 8:00 PM IST</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-200 text-xs mb-0.5">Target Response Window</div>
                  <div className="text-xs text-emerald-300 font-semibold">Within 4 business hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-200 text-xs mb-0.5">Emergency Assistance</div>
                  <div className="text-xs text-emerald-300 font-semibold">24/7 Verified Traveler SOS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ summary */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-3.5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Frequently Asked Inquiries</h3>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-1.5 shrink-0" />
                <span><strong>Booking Confirmation:</strong> Packages are confirmed directly by authorized operators.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-1.5 shrink-0" />
                <span><strong>Guide Verification:</strong> Guides carry verified IDs and background checks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-1.5 shrink-0" />
                <span><strong>Refunds:</strong> Governed by our transparent Booking & Refund Policy.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
            {deliveryResult ? (
              <div className="text-center py-6 sm:py-10 space-y-5">
                {deliveryResult.emailDelivered ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif-display">
                      Message Delivered Successfully!
                    </h2>
                    <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{name}</strong>. Your message was processed and delivered to{' '}
                      <strong>{deliveryResult.recipient}</strong>. Our team will get back to you at{' '}
                      <strong>{email}</strong> within 4 business hours.
                    </p>
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-teal-50 border border-teal-200 rounded-2xl">
                      <span className="text-xs text-stone-500 font-semibold">Reference Ticket:</span>
                      <span className="font-mono-num font-bold text-[#0D9488] text-sm">
                        {deliveryResult.ticketRef}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                      <Info className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif-display">
                      Inquiry Ticket Recorded
                    </h2>
                    <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                      Your support ticket <strong>#{deliveryResult.ticketRef}</strong> has been logged in the platform registry.
                    </p>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left space-y-2 max-w-lg mx-auto">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Email Delivery Notice</span>
                      </div>
                      <p className="leading-relaxed">
                        Automated SMTP email dispatch is currently waiting on server credentials in the deployment environment. To ensure zero delay, please send your inquiry directly to our official address:
                      </p>
                      <div className="pt-2">
                        <a
                          href={mailtoFallbackUrl}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Open in Email App ({deliveryResult.recipient})</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryResult(null);
                      setMessage('');
                      setSubject('');
                    }}
                    className="px-6 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-serif-display">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Fill out the form below. All fields marked with * are required.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Unable to send:</strong> {error}
                      </div>
                    </div>
                  )}

                  {/* Honeypot field for bot spam prevention — hidden from visual users */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="bot-honey">Leave this field empty</label>
                    <input
                      id="bot-honey"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={botHoneypot}
                      onChange={(e) => setBotHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Madhuri Rao"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-category" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        id="contact-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all cursor-pointer"
                      >
                        <option value="Trip Planning & Inquiry">Trip Planning & Custom Route</option>
                        <option value="Tour Package Booking">Tour Package Booking</option>
                        <option value="Local Guide Question">Local Guide Inquiry</option>
                        <option value="Transport & Hotels">Transport & Hotel Queries</option>
                        <option value="Pricing & Transparency">Pricing & Tariff Clarification</option>
                        <option value="Guide Partnership Application">Become a Certified Guide</option>
                        <option value="General Help">General Question / Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your question"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your trip details, requested dates, group size, or questions..."
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all resize-none"
                    />
                    <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                      <span>Minimum 10 characters</span>
                      <span>{message.length} chars</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      id="contact-submit-btn"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-101 active:scale-99"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transmitting Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-teal-300" />
                          <span>Submit Message</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-stone-500 mt-3">
                      🔒 Your details are stored securely per our{' '}
                      <span className="text-[#0D9488] font-semibold">Privacy Policy</span>. We never share your contact information with unverified third parties.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
