import React, { useState } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  User,
  MapPin,
  Languages as LangIcon,
  Phone,
  Mail,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { LocalGuideItem } from '../types';

const isStaticHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { hostname, protocol } = window.location;
  if (protocol === 'file:') return true;
  if (hostname.endsWith('.github.io')) return true;
  if (hostname.endsWith('.vercel.app')) return true;
  if (hostname.endsWith('.netlify.app')) return true;
  return false;
};


interface GuideRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newGuide: LocalGuideItem) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const GuideRegisterModal: React.FC<GuideRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultEmail = '',
  defaultName = '',
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(defaultName || '');
  const [email, setEmail] = useState(defaultEmail || '');
  const [phone, setPhone] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [languagesInput, setLanguagesInput] = useState('English, Telugu, Hindi');
  const [specialtiesInput, setSpecialtiesInput] = useState('Heritage Walks, Temple Protocol, Local Food');
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [dailyRate, setDailyRate] = useState<number>(2000);
  const [bio, setBio] = useState('');
  const [verificationDoc, setVerificationDoc] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredGuide, setRegisteredGuide] = useState<LocalGuideItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a valid contact phone number.');
      return;
    }
    if (!serviceLocation.trim()) {
      setError('Please specify your primary service city or region.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const languages = languagesInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const specialties = specialtiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      // On static hosts (GitHub Pages / Vercel static) there is no API server
      if (isStaticHost()) {
        const localGuide = { id: `guide-${Date.now()}`, name: name.trim(), email: email.trim(), serviceLocation: serviceLocation.trim() };
        setRegisteredGuide(localGuide as any);
        onSuccess(localGuide as any);
        return;
      }

      const response = await fetch('/api/guides/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          serviceLocation: serviceLocation.trim(),
          state: state.trim(),
          languages: languages.length ? languages : ['English', 'Hindi'],
          specialties: specialties.length ? specialties : ['Heritage Tours'],
          experienceYears: Number(experienceYears) || 1,
          dailyRate: Number(dailyRate) || 2000,
          bio: bio.trim() || 'Experienced certified local guide providing authentic and safe travel experiences.',
          verificationDoc: verificationDoc.trim() || 'Govt ID / Tourism Guide License submitted for review',
          avatar: avatarUrl.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.guide) {
        throw new Error(data.error || 'Failed to submit guide registration');
      }

      setRegisteredGuide(data.guide);
      onSuccess(data.guide);
    } catch (err: any) {
      setError(err.message || 'An error occurred while registering. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Banner */}
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
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Pan-India Guide Onboarding</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-display">Become a Verified Local Guide</h2>
              <p className="text-xs text-stone-200 mt-0.5">
                Share your local culture, lead private family excursions, and earn transparent direct bookings.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {registeredGuide ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif-display">
                Registration Submitted Successfully!
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{registeredGuide.name}</strong>. Your profile for{' '}
                <strong>{registeredGuide.serviceLocation}</strong> has been created.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-md mx-auto text-left text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Admin Verification In Progress (Status: Pending)</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  To protect travellers and uphold genuine regional knowledge, every guide profile is reviewed by our administration before receiving the verified badge. You can now access your Guide Dashboard to view inquiries.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done & Close
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guide@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Service City / Area *</label>
                  <input
                    type="text"
                    required
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                    placeholder="e.g. Tirupati, Goa, Jaipur, Varanasi"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Region</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Goa">Goa</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Other">Other India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full-Day Rate (₹)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none font-mono-num font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken (comma separated)</label>
                  <input
                    type="text"
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="English, Hindi, Telugu, Tamil"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialties & Tour Themes</label>
                  <input
                    type="text"
                    value={specialtiesInput}
                    onChange={(e) => setSpecialtiesInput(e.target.value)}
                    placeholder="Temple Protocol, Heritage Walks, Nature"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  License / Verification ID / Credential Reference *
                </label>
                <input
                  type="text"
                  required
                  value={verificationDoc}
                  onChange={(e) => setVerificationDoc(e.target.value)}
                  placeholder="e.g. Ministry of Tourism Badge #IN-2024-883 or Govt ID Reference"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Confidential. Used solely by Trip Together administration for verification.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">About You & Guiding Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce yourself to travellers, your deep local roots, and what makes touring with you unforgettable..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
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
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Guide Application</span>
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
