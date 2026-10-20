import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  Clock,
  MessageSquare,
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  Languages,
  Award,
} from 'lucide-react';
import type { LocalGuideItem } from '../types';

interface GuideDashboardModalProps {
  guide: LocalGuideItem | null;
  onClose: () => void;
  onUpdateGuide: (updated: LocalGuideItem) => void;
}

interface EnquiryItem {
  id: string;
  enquiryRef: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  requestedDate: string;
  groupSize: number;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
}

export const GuideDashboardModal: React.FC<GuideDashboardModalProps> = ({
  guide,
  onClose,
  onUpdateGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'profile'>('enquiries');
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState<boolean>(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replying, setReplying] = useState<boolean>(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Profile Edit fields
  const [dailyRate, setDailyRate] = useState<number>(guide?.dailyRate || 2000);
  const [availability, setAvailability] = useState<string>(guide?.availability || 'Available Today');
  const [bio, setBio] = useState<string>(guide?.bio || '');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (guide?.id) {
      fetch(`/api/guides/${guide.id}/enquiries`)
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.enquiries)) {
            setEnquiries(d.enquiries);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingEnquiries(false));
    } else {
      setLoadingEnquiries(false);
    }
  }, [guide?.id]);

  const handleSendReply = async (enquiryId: string) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/guides/enquiries/${enquiryId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: replyText.trim() }),
      });
      if (res.ok) {
        setReplySuccess('Reply sent to traveler successfully!');
        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === enquiryId
              ? { ...e, status: 'replied', replyMessage: replyText.trim(), repliedAt: new Date().toISOString() }
              : e
          )
        );
        setSelectedEnquiry(null);
        setReplyText('');
        setTimeout(() => setReplySuccess(null), 4000);
      }
    } catch {
    } finally {
      setReplying(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guide) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/guides/${guide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyRate,
          availability,
          bio,
        }),
      });
      const data = await res.json();
      if (res.ok && data.guide) {
        onUpdateGuide(data.guide);
        setProfileSuccess('Guide profile & availability updated in real-time!');
        setTimeout(() => setProfileSuccess(null), 4000);
      }
    } catch {
    } finally {
      setSavingProfile(false);
    }
  };

  if (!guide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 text-center max-w-md w-full">
          <UserCheck className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Guide Profile Loaded</h3>
          <p className="text-xs text-stone-500 mt-1">Please register as a guide or sign in with your guide credentials.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#0D4A42] text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <img
              src={guide.avatar}
              alt={guide.name}
              className="w-11 h-11 rounded-full object-cover border border-stone-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{guide.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    guide.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {guide.verificationStatus === 'verified' ? 'Verified Guide' : 'Under Review'}
                </span>
              </div>
              <p className="text-xs text-stone-500">{guide.serviceLocation} · Guide Dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'enquiries'
                ? 'border-[#0D4A42] text-[#0D4A42]'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Inquiries ({enquiries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#0D4A42] text-[#0D4A42]'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Profile & Tariff Settings</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {replySuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{replySuccess}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {activeTab === 'enquiries' ? (
            <div>
              {loadingEnquiries ? (
                <div className="py-12 text-center text-xs text-stone-400">Loading incoming inquiries...</div>
              ) : enquiries.length === 0 ? (
                <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-6">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-xs font-semibold text-slate-700">No customer inquiries yet</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">When travelers book your guiding services, they will appear right here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{enq.senderName}</span>
                          <span className="text-xs text-stone-400 ml-2">({enq.senderEmail} · {enq.senderPhone})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            enq.status === 'replied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {enq.status === 'replied' ? 'Replied' : 'Pending Response'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                        <div>Date: <span className="font-semibold text-slate-800">{enq.requestedDate}</span></div>
                        <div>Group Size: <span className="font-semibold text-slate-800">{enq.groupSize} Travellers</span></div>
                      </div>

                      <p className="text-xs text-slate-700 p-2.5 rounded-lg bg-white border border-stone-200/60 leading-relaxed">
                        "{enq.message}"
                      </p>

                      {enq.replyMessage && (
                        <div className="text-xs p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900">
                          <span className="font-bold block text-[11px] text-emerald-700 mb-0.5">Your Response:</span>
                          "{enq.replyMessage}"
                        </div>
                      )}

                      {enq.status !== 'replied' && selectedEnquiry?.id !== enq.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setReplyText(`Hi ${enq.senderName}, I am pleased to confirm my availability for ${enq.requestedDate}. Let me know if you would like me to coordinate pickup.`);
                          }}
                          className="text-xs font-semibold text-[#0D4A42] hover:underline cursor-pointer"
                        >
                          Reply to Traveler →
                        </button>
                      )}

                      {selectedEnquiry?.id === enq.id && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-700">Type Your Reply</label>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedEnquiry(null)}
                              className="px-3 py-1.5 text-xs text-stone-500 hover:text-slate-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={replying}
                              onClick={() => handleSendReply(enq.id)}
                              className="px-4 py-1.5 bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                            >
                              {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              <span>Send Reply</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Daily Rate (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    required
                    min={500}
                    max={25000}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                  >
                    <option value="Available Today">Available Today</option>
                    <option value="Available from Tomorrow">Available from Tomorrow</option>
                    <option value="Booking on Request">Booking on Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Biography & Guiding Experience
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
