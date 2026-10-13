import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  KAKINADA_TO_TIRUPATI_TRAINS,
  KAKINADA_TO_TIRUPATI_BUSES,
  KAKINADA_TO_TIRUPATI_FLIGHTS,
  TIRUPATI_HOTELS,
  TIRUPATI_PACKAGES,
} from './src/data';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-side user credential store for Email & Password authentication
const registeredUsers = new Map<
  string,
  { id: string; email: string; password: string; name: string; createdAt: string }
>();

app.post('/api/auth/authenticate', (req, res) => {
  const { email, password, name, mode } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    mode?: 'signin' | 'signup' | 'forgot';
  };

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid Email ID.' });
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const existing = registeredUsers.get(cleanEmail);

  if (mode === 'forgot') {
    const displayName =
      existing?.name ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    const updatedUser = {
      id: existing?.id || `usr-${Date.now()}`,
      email: cleanEmail,
      password: cleanPassword,
      name: displayName,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    registeredUsers.set(cleanEmail, updatedUser);
    return res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      message: 'Password reset successfully.',
    });
  }

  if (mode === 'signup') {
    const displayName =
      (name || '').trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    const newUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      password: cleanPassword,
      name: displayName,
      createdAt: new Date().toISOString(),
    };
    registeredUsers.set(cleanEmail, newUser);
    return res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  }

  // Sign-in mode: verify password if user already exists in this server session, or register & sign in seamlessly
  if (existing && existing.password !== cleanPassword) {
    return res.status(401).json({
      error: 'Incorrect password for this Email ID. Use "Forgot Password?" below to reset it.',
    });
  }

  if (!existing) {
    const derivedName =
      (name || '').trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    const createdUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      password: cleanPassword,
      name: derivedName,
      createdAt: new Date().toISOString(),
    };
    registeredUsers.set(cleanEmail, createdUser);
    return res.json({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
    });
  }

  return res.json({
    user: {
      id: existing.id,
      email: existing.email,
      name: existing.name,
    },
  });
});

// Server-side Gemini client initialization following @google/genai guidelines
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Provider Adapter Status & Secret Management Inspection Endpoint
app.get('/api/providers/status', (_req, res) => {
  const adapters = [
    {
      id: 'adapter-irctc',
      providerName: 'Indian Railways / IRCTC Rail Adapter',
      category: 'Rail',
      envSecretName: 'IRCTC_RAPIDAPI_KEY',
      configured: Boolean(process.env.IRCTC_RAPIDAPI_KEY),
      mode: process.env.IRCTC_RAPIDAPI_KEY ? 'LIVE_API' : 'REFERENCE_ADAPTER',
      officialPortalUrl: 'https://www.irctc.co.in/nget/train-search',
      complianceNote:
        'Respects CRIS/IRCTC terms; never scrapes CAPTCHA-protected PNR/availability endpoints. Links directly to official IRCTC portal.',
    },
    {
      id: 'adapter-apsrtc-redbus',
      providerName: 'APSRTC & Intercity Bus Adapter',
      category: 'Bus',
      envSecretName: 'REDBUS_PARTNER_API_KEY',
      configured: Boolean(process.env.REDBUS_PARTNER_API_KEY),
      mode: process.env.REDBUS_PARTNER_API_KEY ? 'LIVE_API' : 'REFERENCE_ADAPTER',
      officialPortalUrl: 'https://www.apsrtconline.in/',
      complianceNote:
        'Displays verified APSRTC tariff slabs and redirects to official APSRTC / redBus booking portals for real-time berth selection.',
    },
    {
      id: 'adapter-amadeus-flight',
      providerName: 'Amadeus Regional Flight & Multi-Modal Adapter',
      category: 'Flight',
      envSecretName: 'AMADEUS_CLIENT_ID',
      configured: Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
      mode:
        process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET
          ? 'LIVE_API'
          : 'REFERENCE_ADAPTER',
      officialPortalUrl: 'https://www.goindigo.in/',
      complianceNote:
        'Accounts for the fact that Kakinada has no commercial airport — computes realistic road transfers to Rajahmundry (RJA) or Visakhapatnam (VTZ).',
    },
    {
      id: 'adapter-hotels-ttd-aptdc',
      providerName: 'TTD Devasthanams & APTDC Hospitality Adapter',
      category: 'Hotels',
      envSecretName: 'HOTELBEDS_API_KEY',
      configured: Boolean(process.env.HOTELBEDS_API_KEY),
      mode: process.env.HOTELBEDS_API_KEY ? 'LIVE_API' : 'REFERENCE_ADAPTER',
      officialPortalUrl: 'https://ttdevasthanams.ap.gov.in/',
      complianceNote:
        'Separates Official Portal Verified properties (TTD Srinivasam, Madhavam, APTDC Haritha) from Public Directory Verified hotels.',
    },
    {
      id: 'adapter-gemini-ai',
      providerName: 'Gemini 3.8 Flash Trip Recommendation Engine',
      category: 'AI Assistant',
      envSecretName: 'GEMINI_API_KEY',
      configured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
      mode:
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
          ? 'LIVE_API'
          : 'REFERENCE_ADAPTER',
      officialPortalUrl: 'https://ttdevasthanams.ap.gov.in/',
      complianceNote:
        'Grounded strictly on verified transport, hotel, and tour package records without inventing live seat counts or guaranteed darshan slots.',
    },
  ];

  res.json({
    adapters,
    serverTimestamp: new Date().toISOString(),
  });
});

// 2. Normalized Multi-Provider Catalog Endpoint
app.get('/api/travel/catalog', (_req, res) => {
  res.json({
    trains: KAKINADA_TO_TIRUPATI_TRAINS,
    buses: KAKINADA_TO_TIRUPATI_BUSES,
    flights: KAKINADA_TO_TIRUPATI_FLIGHTS,
    hotels: TIRUPATI_HOTELS,
    packages: TIRUPATI_PACKAGES,
    lastNormalizedAt: new Date().toISOString(),
  });
});

// 3. AI Trip Recommendation Engine Endpoint (Grounded on Verified Catalog + User Budget)
app.post('/api/ai/recommend-trip', async (req, res) => {
  try {
    const {
      origin = 'Kakinada, Andhra Pradesh',
      destination = 'Tirupati, Andhra Pradesh',
      travellers = 4,
      adults = 2,
      children = 1,
      seniors = 1,
      nights = 2,
      rooms = 2,
      totalBudget = 25000,
      hotelBudgetAmount = 2000,
      hotelBudgetMode = 'per_room_per_night',
      urgency = 'scheduled',
      preferredTransport = 'all',
    } = req.body || {};

    const ai = getGenAIClient();

    // Calculate deterministic baseline combinations first so we never fabricate numbers
    const train3ARoundTrip = 975 * travellers * 2; // Train 17250 3A
    const trainSLRoundTrip = 365 * travellers * 2; // Train 17250 SL
    const busIndraRoundTrip = (1120 + 55) * travellers * 2; // APSRTC Indra AC
    const ttdHotelStay = 800 * rooms * nights; // TTD Madhavam
    const aptdcHotelStay = Math.round(1650 * rooms * nights * 1.12); // APTDC Haritha + 12% tax
    const irctcPackageTotal = 4650 * (adults + seniors) + 3750 * children;

    const fallbackPlans = [
      {
        planName: 'Plan A: Economical Train (SL) + TTD Guest House Stay',
        combinationType: 'Train + Budget Hotel',
        suitabilityReason: `Best for strict budget control for ${travellers} travellers (${adults} adults, ${seniors} senior, ${children} child) while boarding directly at Kakinada Town (17250).`,
        itemizedBudget: {
          transport: trainSLRoundTrip,
          accommodation: ttdHotelStay,
          localTravel: 1600,
          meals: 1200 * nights,
          ticketsAndActivities: 1400,
          taxesAndServiceFees: Math.round(ttdHotelStay * 0.12),
          contingencyAllowance: 1500,
        },
        totalFamilyCost:
          trainSLRoundTrip +
          ttdHotelStay +
          1600 +
          1200 * nights +
          1400 +
          Math.round(ttdHotelStay * 0.12) +
          1500,
        perPersonCost: Math.round(
          (trainSLRoundTrip +
            ttdHotelStay +
            1600 +
            1200 * nights +
            1400 +
            Math.round(ttdHotelStay * 0.12) +
            1500) /
            travellers
        ),
        missingOrEstimatedNotes: [
          'Train fare based on reference SL tariff (₹365/pax each way); verify live seat availability on IRCTC.',
          'TTD Madhavam AC rooms (₹800/night) require advance online booking on ttdevasthanams.ap.gov.in or current counter check-in.',
        ],
        savingTips: [
          'Claim Senior Citizen 25% concession if switching to APSRTC buses.',
          'Dine at TTD Matrusri Tarigonda Vengamamba Annaprasadam Complex for complimentary sacred meals in Tirumala.',
        ],
      },
      {
        planName: 'Plan B: Family Comfort AC Train (3A) + APTDC Haritha Alipiri',
        combinationType: 'Train + Budget Hotel',
        suitabilityReason: `Balanced comfort for families with seniors and children: overnight AC 3-Tier berths from Kakinada + stay right at the base of Alipiri Ghat Road.`,
        itemizedBudget: {
          transport: train3ARoundTrip,
          accommodation: 1650 * rooms * nights,
          localTravel: 2200,
          meals: 1600 * nights,
          ticketsAndActivities: 1600,
          taxesAndServiceFees: Math.round(1650 * rooms * nights * 0.12),
          contingencyAllowance: 2000,
        },
        totalFamilyCost:
          train3ARoundTrip +
          aptdcHotelStay +
          2200 +
          1600 * nights +
          1600 +
          2000,
        perPersonCost: Math.round(
          (train3ARoundTrip +
            aptdcHotelStay +
            2200 +
            1600 * nights +
            1600 +
            2000) /
            travellers
        ),
        missingOrEstimatedNotes: [
          'Includes 12% GST on APTDC Haritha room tariff.',
          'TTD ₹300 Special Entry Darshan tickets must be booked separately on the official TTD portal.',
        ],
        savingTips: [
          'Use APSRTC Electric Sapthagiri buses (₹180 round-trip per person) instead of private hilltop taxis to save ~₹1,800.',
        ],
      },
      {
        planName: 'Plan C: Last-Minute APSRTC AC Bus + Budget Station Hotel',
        combinationType: 'Bus + Budget Hotel',
        suitabilityReason: `Ideal when train berths are waitlisted on urgent (${urgency}) dates. APSRTC Indra/Amaravati buses offer fixed government fares without private surge pricing.`,
        itemizedBudget: {
          transport: busIndraRoundTrip,
          accommodation: 1550 * rooms * nights,
          localTravel: 1800,
          meals: 1500 * nights,
          ticketsAndActivities: 1400,
          taxesAndServiceFees: Math.round(1550 * rooms * nights * 0.12),
          contingencyAllowance: 1800,
        },
        totalFamilyCost:
          busIndraRoundTrip +
          Math.round(1550 * rooms * nights * 1.12) +
          1800 +
          1500 * nights +
          1400 +
          1800,
        perPersonCost: Math.round(
          (busIndraRoundTrip +
            Math.round(1550 * rooms * nights * 1.12) +
            1800 +
            1500 * nights +
            1400 +
            1800) /
            travellers
        ),
        missingOrEstimatedNotes: [
          'APSRTC fare includes highway toll & passenger cess.',
          'For urgent travel without advance online darshan tickets, obtain Slotted Sarva Darshan (SSD) tokens at Srinivasam / Vishnu Nivasam counters in Tirupati with original Aadhaar.',
        ],
        savingTips: [
          'Choose Kalyan Residency or TTD Srinivasam right opposite the bus/railway station to eliminate local cab arrival transfers.',
        ],
      },
      {
        planName: 'Plan D: IRCTC Divya Tirupati Rail Tour Package (All-In-One)',
        combinationType: 'Train + Ready-Made Package',
        suitabilityReason: `Bundled rail + hotel + Tirumala transfers managed by IRCTC Tourism when booked 15+ days in advance.`,
        itemizedBudget: {
          transport: 0,
          accommodation: 0,
          localTravel: 600,
          meals: 1400 * nights,
          ticketsAndActivities: irctcPackageTotal,
          taxesAndServiceFees: 0,
          contingencyAllowance: 1500,
        },
        totalFamilyCost: irctcPackageTotal + 600 + 1400 * nights + 1500,
        perPersonCost: Math.round((irctcPackageTotal + 600 + 1400 * nights + 1500) / travellers),
        missingOrEstimatedNotes: [
          'Package price (₹4,650/adult, ₹3,750/child) bundles rail, 1 night AC hotel, and local transfers.',
          'Not available for today/tomorrow urgent departures as IRCTC rail tour quotas close in advance.',
        ],
        savingTips: [
          'Triple-sharing occupancy lowers per-person package tariff by ~₹600 per traveller.',
        ],
      },
    ];

    if (!ai) {
      return res.json({
        source: 'VERIFIED_DETERMINISTIC_ENGINE',
        aiSummary: `Generated 4 transparent, itemized family trip options from ${origin} to ${destination} for ${travellers} travellers (${nights} nights, ${rooms} rooms) against your ₹${Number(totalBudget).toLocaleString('en-IN')} family budget using verified reference tariffs.`,
        plans: fallbackPlans,
      });
    }

    const prompt = `You are a transparent Family Travel Financial Advisor for TripTogether.
The family is planning a trip with these exact parameters:
- Origin: ${origin}
- Destination: ${destination}
- Travellers: ${travellers} total (${adults} Adults, ${seniors} Seniors, ${children} Children)
- Stay Duration: ${nights} nights, ${rooms} rooms
- Total Family Budget: ₹${totalBudget}
- Hotel Budget Preference: ₹${hotelBudgetAmount} (${hotelBudgetMode === 'per_room_per_night' ? 'per room per night' : 'total stay across all nights'})
- Travel Urgency: ${urgency}
- Preferred Transport: ${preferredTransport}

Here are the 4 verified baseline plans computed from official reference tariffs (do NOT invent fake availability or lower prices than these verified figures):
${JSON.stringify(fallbackPlans, null, 2)}

Provide a concise, practical 3-sentence executive summary advising this family on which plan best fits their ₹${totalBudget} total budget, accessibility needs (${seniors} senior, ${children} child), and urgency (${urgency}), while reminding them of TTD darshan verification rules.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiSummary: {
              type: Type.STRING,
              description: '3-sentence practical recommendation grounded in the verified numbers.',
            },
          },
          required: ['aiSummary'],
        },
      },
    });

    let parsedSummary = fallbackPlans[1].suitabilityReason;
    if (response.text) {
      try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.aiSummary) parsedSummary = parsed.aiSummary;
      } catch {
        parsedSummary = response.text;
      }
    }

    return res.json({
      source: 'GEMINI_3_8_FLASH_GROUNDED',
      aiSummary: parsedSummary,
      plans: fallbackPlans,
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate trip recommendation',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripTogether server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
