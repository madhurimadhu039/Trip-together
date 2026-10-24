import React from 'react';
import {
  Search,
  Map,
  Users,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Compass,
  Train,
  Hotel,
  Package,
  MessageSquare,
  Star,
  ShieldCheck,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigateHome?: () => void;
  onExploreDestinations?: () => void;
  onPlanTrip?: () => void;
  onViewPackages?: () => void;
  onFindGuides?: () => void;
}

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover Your Destination',
    color: 'from-teal-500 to-[#0D9488]',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'Start Here',
    description:
      'Use the search bar on the homepage to explore any destination across India. You can search by city name, state, or keyword (e.g., "temples in Andhra Pradesh" or "hill stations"). Browse curated destinations like Tirupati, Goa, Manali, and more.',
    features: [
      'Search any destination in India',
      'Filter by category: Pilgrimage, Hill Station, Coastal, Heritage, Adventure',
      'View best season, budget, and key attractions',
      'Save favourites to your wishlist',
    ],
  },
  {
    number: '02',
    icon: Package,
    title: 'Browse Tour Packages',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'Compare & Choose',
    description:
      'Explore verified tour packages with clear day-by-day itineraries, inclusions, exclusions, and transparent pricing. Compare packages side by side and shortlist the ones that match your group size and budget.',
    features: [
      'All-inclusive family packages',
      'Transparent per-person pricing',
      'Day-by-day itinerary details',
      'Inclusions, exclusions, and conditions clearly listed',
    ],
  },
  {
    number: '03',
    icon: Train,
    title: 'Find Transport & Hotels',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'Book Smarter',
    description:
      'Compare trains, buses, and flights from your pickup location to your destination. View verified tariff slabs for all transport modes, then choose hotels and stays that match your budget and comfort level.',
    features: [
      'Compare trains, buses, and flights in one place',
      'Links directly to IRCTC, APSRTC, and airline portals',
      'Filter hotels by price per night and room type',
      'TTD Devasthanams and APTDC accommodations included',
    ],
  },
  {
    number: '04',
    icon: Map,
    title: 'Plan Your Itinerary',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'AI Assisted',
    description:
      'Use the Trip Planner to build a custom day-by-day itinerary. Add, reorder, and personalise activities for each day. Click "Get AI Recommendations" to generate a tailored itinerary based on your destination, travel dates, and group size.',
    features: [
      'Drag-and-drop day scheduling',
      'AI-powered itinerary suggestions',
      'Accounts for senior citizen rest times',
      'Export and save your itinerary',
    ],
  },
  {
    number: '05',
    icon: Users,
    title: 'Connect With a Local Guide',
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'Verified Guides',
    description:
      'Browse certified local guides by destination. View their profiles, languages spoken, specialties, ratings, and daily rates. Send a direct enquiry to book a guide for your travel dates.',
    features: [
      'Verified local guides with credentials',
      'Filter by location, language, and specialty',
      'View detailed guide profiles and reviews',
      'Contact guides directly from the platform',
    ],
  },
  {
    number: '06',
    icon: CheckSquare,
    title: 'Collaborate With Your Group',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'Family Tools',
    description:
      'Keep your travel group organised using the collaboration tools. Track your group\'s budget, manage a shared packing checklist, and chat privately in the family group message thread.',
    features: [
      'Shared packing checklist with quantity tracking',
      'Private family group chat',
      'My Bookings & Budget ledger',
      'Consent-based live location tracking',
    ],
  },
  {
    number: '07',
    icon: Sparkles,
    title: 'Submit an Enquiry & Travel',
    color: 'from-[#0F1E36] to-[#1E3A8A]',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'Final Step',
    description:
      'When you\'re ready, submit a booking enquiry for your chosen tour package or guide. Our team will confirm the booking and contact you with next steps. You\'re all set — time to travel!',
    features: [
      'Submit package and guide booking enquiries',
      'Receive a booking reference number',
      'Coordinator contacts you within 4 business hours',
      'Manage all bookings from your Traveller Dashboard',
    ],
  },
];

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigateHome,
  onExploreDestinations,
  onPlanTrip,
  onViewPackages,
  onFindGuides,
}) => {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-12">
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
        <span className="text-slate-800 font-semibold">How It Works</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D9488] text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Seamless Journey Flow</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display">
          How Trip Together Works
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Plan your perfect trip in a few simple steps. From discovering destinations to managing
          group collaboration — Trip Together handles it all in one place.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isEven = idx % 2 === 1;
          return (
            <div
              key={step.number}
              className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-start gap-6 lg:gap-10`}
            >
              {/* Step Number & Icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-9 h-9 text-white" />
                </div>
                <div className="text-4xl font-bold text-stone-200 font-mono-num hidden lg:block">
                  {step.number}
                </div>
              </div>

              {/* Step Content */}
              <div className={`flex-1 ${step.bg} border ${step.border} rounded-3xl p-6 sm:p-8 space-y-4`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 mb-1">
                      <span className="font-mono-num">{step.number}</span>
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 font-serif-display">
                      {step.title}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-600 shrink-0">
                    {step.badge}
                  </span>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed">{step.description}</p>

                <ul className="space-y-2">
                  {step.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why Trip Together */}
      <section className="bg-gradient-to-r from-[#0F1E36] to-[#1E3A8A] rounded-3xl p-8 sm:p-12 text-white space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-display">
            Why Families Choose Trip Together
          </h2>
          <p className="text-sm text-stone-300">
            Built for transparent, trustworthy, and stress-free travel
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: ShieldCheck, label: 'Verified Providers', desc: 'No fake availability or invented bookings' },
            { icon: Star, label: 'Genuine Reviews', desc: 'Real feedback from verified travellers' },
            { icon: Users, label: 'Group Collaboration', desc: 'Chat, checklists, and budget for the whole family' },
            { icon: Sparkles, label: 'AI Itineraries', desc: 'Smart recommendations tailored to your trip' },
            { icon: MessageSquare, label: '4-Hour Support', desc: 'Responsive team for all your travel questions' },
            { icon: Hotel, label: 'No Hidden Fees', desc: 'Transparent pricing with zero markups' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white/10 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-teal-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold">{item.label}</div>
                <div className="text-xs text-stone-300">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 font-serif-display">
          Ready to Plan Your Next Trip?
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Start by exploring destinations or jump straight into the Trip Planner with AI-assisted
          itinerary building.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onExploreDestinations}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Explore Destinations
          </button>
          <button
            type="button"
            onClick={onPlanTrip}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Plan a Trip
          </button>
          <button
            type="button"
            onClick={onViewPackages}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <Package className="w-4 h-4" />
            View Tour Packages
          </button>
        </div>
      </section>
    </div>
  );
};
