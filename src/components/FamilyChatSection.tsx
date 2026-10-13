import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Link2,
  CheckSquare,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Check,
} from 'lucide-react';
import type {
  ChatMessage,
  FamilyMember,
  ChecklistItem,
  SavedBookingItem,
} from '../types';

interface FamilyChatSectionProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  members: FamilyMember[];
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  checklistItems: ChecklistItem[];
  savedBookings: SavedBookingItem[];
}

export const FamilyChatSection: React.FC<FamilyChatSectionProps> = ({
  messages,
  setMessages,
  members,
  activeMemberId,
  setActiveMemberId,
  checklistItems,
  savedBookings,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedChecklistAttachment, setSelectedChecklistAttachment] = useState('');
  const [selectedBookingAttachment, setSelectedBookingAttachment] = useState('');
  const [sentStatus, setSentStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText =
      inputText.trim() ||
      (selectedChecklistAttachment || selectedBookingAttachment
        ? ''
        : `👋 Hello everyone! Ready for our family trip.`);

    let attachmentType: ChatMessage['attachmentType'] | undefined;
    let attachmentTitle: string | undefined;
    let attachmentUrl: string | undefined;

    if (selectedChecklistAttachment) {
      const item = checklistItems.find((c) => c.id === selectedChecklistAttachment);
      if (item) {
        attachmentType = 'checklist_item';
        attachmentTitle = `${item.itemName} (${item.packedQuantity}/${item.requiredQuantity} packed · Assigned to ${item.assignedToName})`;
      }
    } else if (selectedBookingAttachment) {
      const bk = savedBookings.find((b) => b.id === selectedBookingAttachment);
      if (bk) {
        attachmentType = 'booking_link';
        attachmentTitle = `${bk.title} — ₹${bk.totalFamilyCost.toLocaleString('en-IN')}`;
        attachmentUrl = bk.officialUrl;
      }
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeMember.id,
      senderName: activeMember.name,
      senderRole: activeMember.role,
      text:
        cleanText ||
        `Shared a ${attachmentType === 'checklist_item' ? 'packing checklist item' : 'shortlisted booking option'} with the family.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentType,
      attachmentTitle,
      attachmentUrl,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedChecklistAttachment('');
    setSelectedBookingAttachment('');
    setSentStatus('✓ Sent!');
    setTimeout(() => {
      setSentStatus(null);
    }, 1800);
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className="space-y-6">
      {/* Header & Active Member Identity Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            Private Trip Group #TT-8492 · End-to-End Family Collaboration
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Family Trip Chat & Shared Booking Updates
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#0D4A42]" />
          <span className="text-xs text-slate-600">Posting as authenticated member:</span>
          <select
            value={activeMemberId}
            onChange={(e) => setActiveMemberId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-900"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Thread & Quick Share Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col h-[560px]">
          <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>Travelers ({members.length}):</strong>{' '}
              {members.map((m) => m.name).join(', ')}
            </span>
            <span className="font-mono-num">{messages.length} messages</span>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === activeMember.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-800">{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.senderRole}</span>
                    <span>·</span>
                    <span className="font-mono-num">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-xl rounded-xl p-4 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#0D4A42] text-white'
                        : 'bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.attachmentTitle && (
                      <div
                        className={`mt-3 p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                          isMe
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {msg.attachmentType === 'checklist_item' ? (
                            <CheckSquare className="w-4 h-4 shrink-0" />
                          ) : (
                            <Link2 className="w-4 h-4 shrink-0" />
                          )}
                          <span className="font-medium">{msg.attachmentTitle}</span>
                        </div>
                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 underline font-semibold shrink-0"
                          >
                            Open
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200 bg-slate-50 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedChecklistAttachment}
                onChange={(e) => {
                  setSelectedChecklistAttachment(e.target.value);
                  if (e.target.value) setSelectedBookingAttachment('');
                }}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
              >
                <option value="">Attach Packing Checklist Item (Optional)...</option>
                {checklistItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.category}] {item.itemName} ({item.packedQuantity}/{item.requiredQuantity})
                  </option>
                ))}
              </select>

              <select
                value={selectedBookingAttachment}
                onChange={(e) => {
                  setSelectedBookingAttachment(e.target.value);
                  if (e.target.value) setSelectedChecklistAttachment('');
                }}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
              >
                <option value="">Attach Shortlisted Booking Link (Optional)...</option>
                {savedBookings.map((bk) => (
                  <option key={bk.id} value={bk.id}>
                    [{bk.category}] {bk.title} (₹{bk.totalFamilyCost.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message the family as ${activeMember.name}...`}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D4A42]"
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                  sentStatus
                    ? 'bg-emerald-700 text-white'
                    : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
                }`}
              >
                {sentStatus ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Shared Trip Decisions & Access Control Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pinned Family Decisions & Quick Share
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any item below to post an instant status update into the family chat
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-900">
                1. Confirm TTD Aadhaar & Dress Code Check
              </div>
              <p className="text-slate-600">
                Remind all 4 family members to carry original Aadhaar cards and traditional attire for Vaikuntam Queue Complex entry.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: activeMember.id,
                      senderName: activeMember.name,
                      senderRole: activeMember.role,
                      text: 'Reminder: Please ensure all 4 original Aadhaar cards and traditional dress sets are packed in the main cabin bag for Tirumala security check.',
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      attachmentType: 'checklist_item',
                      attachmentTitle: 'Original Aadhaar Cards & Traditional Attire (4/4)',
                    },
                  ]);
                }}
                className="px-3 py-1.5 text-xs font-medium text-[#0D4A42] border border-[#0D4A42] rounded-lg hover:bg-emerald-50 whitespace-nowrap shrink-0"
              >
                Post Reminder to Chat
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-900">
                2. Share Shortlisted Train 17250 Booking Link
              </div>
              <p className="text-slate-600">
                Kakinada Port – Tirupati Express (15:10 CCT → 04:25 TPTY).
              </p>
              <button
                type="button"
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: activeMember.id,
                      senderName: activeMember.name,
                      senderRole: activeMember.role,
                      text: 'Sharing the direct IRCTC link for Train 17250 Kakinada–Tirupati Express so we can book all 4 berths together.',
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      attachmentType: 'booking_link',
                      attachmentTitle: 'IRCTC Official Portal — Train 17250',
                      attachmentUrl: 'https://www.irctc.co.in/nget/train-search',
                    },
                  ]);
                }}
                className="px-3 py-1.5 text-xs font-medium text-[#0D4A42] border border-[#0D4A42] rounded-lg hover:bg-emerald-50 whitespace-nowrap shrink-0"
              >
                Share IRCTC Link in Chat
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#0D4A42]" />
              Access & Sync Status
            </div>
            <p>
              Messages are scoped strictly to Trip Group #TT-8492 and synchronized across tabs and local family storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
