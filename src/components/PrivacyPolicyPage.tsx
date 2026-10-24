import React from 'react';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Globe,
  Mail,
  FileText,
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateHome?: () => void;
  onContactUs?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onNavigateHome,
  onContactUs,
}) => {
  const lastUpdated = 'October 2026';

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-[#0D9488] transition-colors cursor-pointer font-semibold"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Privacy Policy</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F1E36] to-[#1E3A8A] rounded-3xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-teal-300 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">Privacy Policy</h1>
            <p className="text-sm text-stone-300 mt-1">
              Trip Together — Last updated: {lastUpdated}
            </p>
            <p className="text-xs text-stone-400 mt-2 max-w-xl leading-relaxed">
              This policy explains how Trip Together collects, uses, and protects your personal
              information when you use our travel planning platform.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-8 shadow-xs">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">1. What Information We Collect</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Trip Together collects information you provide directly when you use our platform:
          </p>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Account Information:</strong> Name and email address when you sign up or sign in. Passwords are stored locally in your browser's storage and are never sent to external servers in plain text.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Trip & Booking Data:</strong> Pickup locations, destinations, travel dates, traveller names, and budget preferences you enter while planning a trip.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Contact & Support Messages:</strong> Name, email, subject, and message content when you contact us through the support form.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Guide Applications:</strong> Name, phone number, location, and professional credentials submitted when applying to become a local guide.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Reviews:</strong> Name and comments submitted as part of travel reviews.</span>
            </li>
          </ul>
          <p className="text-sm text-stone-600 leading-relaxed mt-2">
            We also collect certain information automatically, such as browser type and pages visited, to improve the platform's performance.
          </p>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Information</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>To operate and improve the Trip Together travel planning platform.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>To process booking enquiries and connect you with tour packages or local guides.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>To respond to your support tickets and contact form messages.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>To save your trip itinerary, packing checklist, and bookings across sessions using browser localStorage.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>To display your submitted reviews on the platform (only name and location are shown publicly).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>To verify guide credentials submitted during guide registration (reviewed by our admin team).</span>
            </li>
          </ul>
          <p className="text-sm text-stone-600 leading-relaxed">
            We do <strong>not</strong> use your information for advertising, sell your data to third parties, or share your travel details with telemarketers.
          </p>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">3. Location Data (Consent-Based GPS)</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            The Family Live Tracking feature uses your device's GPS to share approximate location
            with other members of your travel group. This requires explicit, in-browser permission
            from each individual traveller.
          </p>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Location data is shared only with your named family members, not with Trip Together servers or third parties.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>You can revoke location permission at any time through your browser settings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>No background location tracking takes place without your explicit consent.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">4. How We Store and Protect Your Data</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Browser Storage:</strong> Trip data, itineraries, packing checklists, and session details are stored in your device's localStorage. This data stays on your device and is not sent to our servers unless you explicitly submit a booking or contact form.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Server-Side Storage:</strong> Submitted bookings, guide applications, contact tickets, and reviews are stored in a secure server-side database. Access is restricted to the platform's admin team.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Guide Credentials:</strong> Verification documents submitted by guide applicants are stored securely and are never displayed publicly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Passwords:</strong> Passwords are stored in plain text in our development database only. We strongly recommend using a unique password. We do not implement commercial-grade password hashing in the current version of this platform.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">5. Sharing Your Information</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Trip Together does not sell, rent, or trade your personal information. We may share
            limited information in the following situations:
          </p>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>With Local Guides:</strong> When you submit a guide enquiry, your name, email, travel date, group size, and message are shared with the relevant guide so they can respond to your request.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>AI Recommendations:</strong> Trip details (origin, destination, travellers, budget) are sent to the Google Gemini AI API to generate itinerary suggestions. No personally identifiable information is included in these calls.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Official Portals:</strong> When you click links to IRCTC, APSRTC, or TTD Devasthanams, you leave our platform and those portals' own privacy policies apply.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 6 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">6. Cookies and Third-Party Services</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Trip Together does not use advertising cookies or third-party tracking scripts. We use:
          </p>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>localStorage:</strong> To persist your trip data, session, and preferences across page refreshes. You can clear this at any time from your browser's storage settings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Google Fonts:</strong> For typography. Google may log font requests; see <a href="https://fonts.google.com/about" target="_blank" rel="noopener noreferrer" className="text-[#0D9488] underline">Google Fonts privacy</a>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Unsplash Images:</strong> Destination images are served from Unsplash CDN. No personal data is shared with Unsplash.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Google Gemini AI:</strong> Used for AI trip recommendations when the API key is configured. Trip parameters (no PII) are sent via a secure server-side call.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 7 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">7. Data Retention</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Data stored in your browser (localStorage) is retained until you clear it from your browser settings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Booking enquiries and support tickets are retained for a reasonable period to allow follow-up communication.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Reviews are retained as long as they remain published on the platform.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 8 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">8. Your Rights</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            You have the right to:
          </p>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Request a copy of the personal data we hold about you.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Ask us to correct or delete your personal information.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Withdraw consent for location sharing at any time through your browser settings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Clear your browser storage to remove locally stored trip data.</span>
            </li>
          </ul>
          <p className="text-sm text-stone-600 leading-relaxed">
            To exercise any of these rights, contact us at:{' '}
            <button
              type="button"
              onClick={onContactUs}
              className="text-[#0D9488] hover:underline cursor-pointer font-semibold"
            >
              Contact Us
            </button>
          </p>
        </section>

        <div className="border-t border-stone-100" />

        {/* Section 9 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">9. Contact Us About Privacy</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your personal
            information, please reach out:
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm space-y-2">
            <div>
              <strong className="text-slate-900">Email:</strong>{' '}
              <a href="mailto:madhurimadhu039@gmail.com" className="text-[#0D9488] hover:underline">
                madhurimadhu039@gmail.com
              </a>
            </div>
            <div>
              <strong className="text-slate-900">Platform:</strong>{' '}
              <button
                type="button"
                onClick={onContactUs}
                className="text-[#0D9488] hover:underline cursor-pointer"
              >
                Trip Together Contact Form
              </button>
            </div>
          </div>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This Privacy Policy is written based on the actual
          functionality of the Trip Together platform. It does not constitute legal compliance
          advice. As the platform evolves, this policy will be updated accordingly.
        </div>
      </div>

      {/* Back to Home */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-8 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-sm font-bold transition-all shadow-md cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

// Re-export MapPin since it's used inside but not imported at top
import { MapPin } from 'lucide-react';
