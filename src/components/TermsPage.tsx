import React from 'react';
import { FileText, Users, CreditCard, Shield, AlertTriangle, Mail, CheckCircle2 } from 'lucide-react';

interface TermsPageProps {
  onNavigateHome?: () => void;
  onContactUs?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigateHome, onContactUs }) => {
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
        <span className="text-slate-800 font-semibold">Terms & Conditions</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F1E36] to-[#1E3A8A] rounded-3xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-teal-300 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">Terms & Conditions</h1>
            <p className="text-sm text-stone-300 mt-1">Trip Together — Last updated: {lastUpdated}</p>
            <p className="text-xs text-stone-400 mt-2 max-w-xl leading-relaxed">
              Please read these terms carefully before using the Trip Together travel planning
              platform. By accessing or using the service, you agree to these terms.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-8 shadow-xs">
        {/* 1. Acceptance */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            By accessing or using Trip Together (the "Platform"), you confirm that you are at least
            18 years of age (or have parental consent if younger), and that you agree to be bound by
            these Terms and Conditions. If you do not agree to these terms, please do not use the
            Platform.
          </p>
        </section>

        <div className="border-t border-stone-100" />

        {/* 2. Account Registration */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">2. Account Registration & Acceptable Use</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>You must provide accurate and truthful information when creating an account. Using false names, email addresses, or impersonating other individuals is prohibited.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with others.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>You agree not to use the Platform to post false reviews, submit fraudulent bookings, or attempt to manipulate pricing information.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>You agree not to use automated tools, bots, or scraping scripts to extract data from the Platform.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Accounts that violate these rules may be suspended or permanently removed.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* 3. Trip Planning */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">3. Trip Planning & Booking Rules</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Trip Together is a <strong>trip planning and discovery platform</strong>. Booking enquiries submitted through the Platform are forwarded to the relevant tour operators or guides; they are not direct, confirmed bookings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Rail bookings (IRCTC), bus bookings (APSRTC), and TTD darshan tokens are processed exclusively on their respective official portals. Trip Together links you to those portals but does not book tickets on your behalf.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Budget estimates displayed on the Platform are based on verified reference tariff data and are subject to change. Confirm exact pricing with the provider before making payments.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>AI-generated itinerary suggestions are recommendations only, not guaranteed services or bookings.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* 4. Pricing & Payments */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">4. Pricing, Payment & Cancellations</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Tour Packages:</strong> Prices are displayed per person and are verified at the time of listing. Actual amounts may vary based on group size, season, and operator confirmation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Cancellations:</strong> Cancellation and refund policies are set by individual tour operators and local guides. Trip Together does not process refunds directly. Please confirm cancellation terms with the operator when booking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>Local Guides:</strong> Guide rates are displayed in their profiles. Payment and cancellation terms should be agreed directly with the guide before confirming an engagement.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span><strong>No Hidden Charges:</strong> Trip Together does not add service fees, booking surcharges, or hidden markups to the prices displayed on the Platform.</span>
            </li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Important:</strong> Trip Together does not process payments directly. Any payment you make is to the tour operator, hotel, or guide—not to Trip Together. We do not guarantee refunds for third-party services.
          </div>
        </section>

        <div className="border-t border-stone-100" />

        {/* 5. Responsibilities */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">5. Traveller & Guide Responsibilities</h2>
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Travellers agree to:</h3>
              <ul className="space-y-1.5 text-sm text-stone-600 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>Submit booking enquiries and guide contact requests in good faith and with genuine intent to travel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>Confirm all safety, health, visa, and travel requirements for their chosen destination independently.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>Submit honest and accurate reviews based on actual travel experience.</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Local Guides agree to:</h3>
              <ul className="space-y-1.5 text-sm text-stone-600 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>Provide accurate credentials, valid certifications, and honest service descriptions when registering.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>Respond to traveller enquiries in a timely and professional manner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>Comply with local tourism regulations and safety standards during guided tours.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="border-t border-stone-100" />

        {/* 6. Platform Limitations */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">6. Platform Limitations & Disclaimer</h2>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 pl-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Trip Together provides travel information, planning tools, and connectivity services. We are not a travel agency and do not hold travel licences under IATA or similar bodies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>We strive to display accurate, verified information, but transport schedules, hotel availability, and pricing may change without notice. Always verify with the official provider before travelling.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Trip Together is not liable for loss, injury, delay, or dissatisfaction arising from services provided by third-party operators, guides, hotels, or transport providers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
              <span>Darshan quotas at TTD and other religious sites are governed by their official bodies. Trip Together does not guarantee queue access, tokens, or entry to any religious or government-controlled venue.</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-stone-100" />

        {/* 7. Dispute Handling */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">7. Dispute Handling & Contact</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            If you have a concern, complaint, or dispute arising from your use of Trip Together,
            please contact us through the support form. We will endeavour to respond within 4
            business hours and work with you to resolve the issue fairly.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            These Terms are governed by the laws of India. Any disputes that cannot be resolved
            amicably will be subject to the jurisdiction of courts in Andhra Pradesh, India.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm space-y-1.5">
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:madhurimadhu039@gmail.com" className="text-[#0D9488] hover:underline">
                madhurimadhu039@gmail.com
              </a>
            </div>
            <div>
              <strong>Contact Form:</strong>{' '}
              <button
                type="button"
                onClick={onContactUs}
                className="text-[#0D9488] hover:underline cursor-pointer"
              >
                Trip Together Contact Page
              </button>
            </div>
          </div>
        </section>

        <div className="border-t border-stone-100" />

        {/* 8. Changes */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">8. Changes to These Terms</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            We may update these Terms from time to time to reflect changes in the Platform's
            features or applicable law. The "Last updated" date at the top of this page will be
            revised accordingly. Continued use of the Platform after changes are published
            constitutes your acceptance of the updated Terms.
          </p>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong>Note:</strong> These Terms & Conditions are written to reflect Trip Together's
          actual functionality as a travel planning and guide discovery platform. They should not
          be treated as formal legal advice.
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
