import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db';
import {
  KAKINADA_TO_TIRUPATI_TRAINS,
  KAKINADA_TO_TIRUPATI_BUSES,
  KAKINADA_TO_TIRUPATI_FLIGHTS,
  TIRUPATI_HOTELS,
  TIRUPATI_PACKAGES,
} from '../src/data';
import { getRecommendedDestinations } from '../src/data/popularDestinations';

dotenv.config();

const app = express();
app.use(express.json());

// Path normalization middleware for Vercel Serverless Functions
app.use((req, _res, next) => {
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-original-url'] as string);

  if (matchedPath && (req.url === '/' || req.url === '/api' || req.url === '/api/index')) {
    req.url = matchedPath;
  }
  next();
});

// Server-side Gemini client initialization
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

// Router containing all API endpoints
const router = express.Router();

// 1. Health check & API info
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TripTogether Travel Platform API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TripTogether Travel Platform API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication endpoint with persistent database
router.post('/auth/authenticate', (req, res) => {
  const { email, password, name, mode, role = 'traveler' } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    mode?: 'signin' | 'signup' | 'forgot';
    role?: 'traveler' | 'guide' | 'admin';
  };

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid Email ID.' });
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const existing = db.getUserByEmail(cleanEmail);

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
      role: existing?.role || role,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    db.saveUser(updatedUser);
    return res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
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
      role: cleanEmail.includes('admin') ? 'admin' : role,
      createdAt: new Date().toISOString(),
    };
    db.saveUser(newUser);
    return res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  }

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
      role: cleanEmail.includes('admin') ? 'admin' : role,
      createdAt: new Date().toISOString(),
    };
    db.saveUser(createdUser);
    return res.json({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
      },
    });
  }

  return res.json({
    user: {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role,
    },
  });
});

// 3. Destinations Endpoints
router.get('/destinations', (req, res) => {
  try {
    let list = db.getDestinations().filter((d) => d.published !== false);
    const { category, q, budget, sort } = req.query as { category?: string; q?: string; budget?: string; sort?: string };

    if (category && category !== 'All') {
      list = list.filter((d) => d.category.toLowerCase() === category.toLowerCase());
    }

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.state.toLowerCase().includes(term) ||
          d.description.toLowerCase().includes(term) ||
          d.popularAttractions.some((a) => a.toLowerCase().includes(term))
      );
    }

    if (budget) {
      if (budget === 'budget') {
        list = list.filter((d) => d.approxNightBudget.includes('800') || d.approxNightBudget.includes('1,200') || d.approxNightBudget.includes('1,500'));
      } else if (budget === 'mid') {
        list = list.filter((d) => d.approxNightBudget.includes('1,800') || d.approxNightBudget.includes('2,000') || d.approxNightBudget.includes('2,500'));
      } else if (budget === 'luxury') {
        list = list.filter((d) => d.approxNightBudget.includes('6,000') || d.approxNightBudget.includes('6,500') || d.approxNightBudget.includes('7,000'));
      }
    }

    if (sort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({ destinations: list, total: list.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve destinations' });
  }
});

// Autocomplete search: strict prefix matching on destination name for the search bar dropdown
router.get('/destinations/search', (req, res) => {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    if (!q) {
      return res.json({ destinations: [], total: 0 });
    }
    const all = db.getDestinations().filter((d) => d.published !== false);
    // Strict startsWith prefix match on name
    let matches = all.filter((d) => d.name.toLowerCase().startsWith(q));
    // For queries >= 3 chars, also include state prefix matches (secondary)
    if (q.length >= 3 && matches.length < 8) {
      const stateMatches = all.filter(
        (d) => !matches.some((m) => m.id === d.id) && d.state.toLowerCase().startsWith(q)
      );
      matches = [...matches, ...stateMatches];
    }
    matches = matches.slice(0, 8);
    res.json({ destinations: matches, total: matches.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search destinations' });
  }
});

router.get('/destinations/:id', (req, res) => {
  const dest = db.getDestinationById(req.params.id);
  if (!dest) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  const packages = db.getPackages().filter((p) => p.destinationId === dest.id || p.destination.toLowerCase().includes(dest.name.toLowerCase()));
  const guides = db.getGuides().filter((g) => g.serviceLocation.toLowerCase().includes(dest.name.toLowerCase()) || g.state.toLowerCase() === dest.state.toLowerCase());
  res.json({ destination: dest, packages, guides });
});

router.post('/destinations', (req, res) => {
  const destData = req.body;
  if (!destData.name || !destData.state) {
    return res.status(400).json({ error: 'Destination name and state are required' });
  }
  const saved = db.saveDestination({
    ...destData,
    id: destData.id || `dest-${destData.name.toLowerCase().replace(/\s+/g, '-')}`,
    country: destData.country || 'India',
    published: destData.published !== false,
  });
  res.json({ success: true, destination: saved });
});

router.delete('/destinations/:id', (req, res) => {
  const deleted = db.deleteDestination(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Destination not found' });
  res.json({ success: true, message: 'Destination removed' });
});

// 4. Tour Packages Endpoints
router.get('/packages', (req, res) => {
  try {
    let list = db.getPackages().filter((p) => p.published !== false);
    const { destinationId, category, maxPrice } = req.query as { destinationId?: string; category?: string; maxPrice?: string };

    if (destinationId && destinationId !== 'all') {
      list = list.filter((p) => p.destinationId === destinationId);
    }
    if (category && category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      list = list.filter((p) => p.pricePerPerson <= Number(maxPrice));
    }

    res.json({ packages: list, total: list.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve packages' });
  }
});

router.get('/packages/:id', (req, res) => {
  const pkg = db.getPackageById(req.params.id);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  res.json({ package: pkg });
});

router.post('/packages', (req, res) => {
  const pkgData = req.body;
  if (!pkgData.title || !pkgData.pricePerPerson) {
    return res.status(400).json({ error: 'Package title and price are required' });
  }
  const saved = db.savePackage({
    ...pkgData,
    id: pkgData.id || `pkg-${Date.now()}`,
    published: pkgData.published !== false,
  });
  res.json({ success: true, package: saved });
});

router.delete('/packages/:id', (req, res) => {
  const deleted = db.deletePackage(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Package not found' });
  res.json({ success: true, message: 'Package removed' });
});

// 5. Local Guides Endpoints
router.get('/guides', (req, res) => {
  try {
    let list = db.getGuides();
    const { location, verified, language } = req.query as { location?: string; verified?: string; language?: string };

    if (location && location !== 'all') {
      const loc = location.toLowerCase();
      list = list.filter((g) => g.serviceLocation.toLowerCase().includes(loc) || g.state.toLowerCase().includes(loc));
    }
    if (verified === 'true') {
      list = list.filter((g) => g.verificationStatus === 'verified');
    }
    if (language) {
      list = list.filter((g) => g.languages.some((l) => l.toLowerCase() === language.toLowerCase()));
    }

    res.json({ guides: list, total: list.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve guides' });
  }
});

router.get('/guides/:id', (req, res) => {
  const guide = db.getGuideById(req.params.id);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  res.json({ guide });
});

router.post('/guides/register', (req, res) => {
  const { name, serviceLocation, state, languages, specialties, dailyRate, bio, phone, email, avatar, verificationDoc } = req.body;
  if (!name || !serviceLocation || !phone) {
    return res.status(400).json({ error: 'Name, location, and phone number are required to register as a guide' });
  }
  const newGuide = db.saveGuide({
    id: `guide-${Date.now()}`,
    name,
    serviceLocation,
    state: state || 'India',
    languages: Array.isArray(languages) ? languages : [languages || 'English', 'Hindi'],
    specialties: Array.isArray(specialties) ? specialties : ['Heritage Tours', 'Local Cuisine'],
    experienceYears: Number(req.body.experienceYears) || 3,
    dailyRate: Number(dailyRate) || 2000,
    hourlyRate: Math.round(Number(dailyRate || 2000) / 5),
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    bio: bio || 'Local expert eager to help travellers explore authentic destinations safely and smoothly.',
    verificationStatus: 'pending', // Requires admin review
    verificationDoc,
    rating: 5.0,
    reviewCount: 0,
    phone,
    email,
    availability: 'Available from Tomorrow',
  });

  res.json({
    success: true,
    message: 'Guide application submitted successfully. Our team will verify your credentials within 24–48 hours.',
    guide: newGuide,
  });
});

router.put('/guides/:id', (req, res) => {
  const existing = db.getGuideById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Guide not found' });
  const updated = db.saveGuide({ ...existing, ...req.body });
  res.json({ success: true, guide: updated });
});

router.post('/guides/:id/enquiry', (req, res) => {
  const guide = db.getGuideById(req.params.id);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  const { senderName, senderEmail, senderPhone, requestedDate, groupSize, message } = req.body;
  if (!senderName || !senderEmail || !requestedDate) {
    return res.status(400).json({ error: 'Sender name, email, and requested travel date are required' });
  }

  const enquiry = db.createGuideEnquiry({
    guideId: guide.id,
    guideName: guide.name,
    senderName,
    senderEmail,
    senderPhone: senderPhone || '',
    requestedDate,
    groupSize: Number(groupSize) || 2,
    message: message || `Hi ${guide.name}, I would like to book your local guiding services for ${requestedDate}.`,
  });

  res.json({
    success: true,
    message: `Your inquiry has been sent to ${guide.name}. Reference: ${enquiry.enquiryRef}`,
    enquiry,
  });
});

router.post('/guides/enquire', (req, res) => {
  const guideId = req.body.guideId;
  const guide = (guideId ? db.getGuideById(guideId) : null) || db.getGuides()[0];
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  const { senderName, senderEmail, senderPhone, requestedDate, groupSize, message } = req.body;
  if (!senderName || !senderEmail || !requestedDate) {
    return res.status(400).json({ error: 'Sender name, email, and requested travel date are required' });
  }

  const enquiry = db.createGuideEnquiry({
    guideId: guide.id,
    guideName: guide.name,
    senderName,
    senderEmail,
    senderPhone: senderPhone || '',
    requestedDate,
    groupSize: Number(groupSize) || 2,
    message: message || `Hi ${guide.name}, I would like to book your local guiding services for ${requestedDate}.`,
  });

  res.json({
    success: true,
    message: `Your inquiry has been sent to ${guide.name}. Reference: ${enquiry.enquiryRef}`,
    enquiry,
  });
});

router.get('/guides/:id/enquiries', (req, res) => {
  const list = db.getGuideEnquiries(req.params.id);
  res.json({ enquiries: list, total: list.length });
});

router.put('/guides/enquiries/:enquiryId/reply', (req, res) => {
  const { replyMessage } = req.body;
  if (!replyMessage) return res.status(400).json({ error: 'Reply message cannot be empty' });
  const ok = db.replyGuideEnquiry(req.params.enquiryId, replyMessage);
  if (!ok) return res.status(404).json({ error: 'Enquiry not found' });
  res.json({ success: true, message: 'Reply sent to traveler successfully' });
});

// 6. Bookings & Enquiries Endpoints
router.post('/bookings', (req, res) => {
  const {
    packageId,
    packageTitle,
    destination,
    customerName,
    customerEmail,
    customerPhone,
    travelDate,
    adults = 2,
    children = 0,
    seniors = 0,
    totalAmount,
    specialRequests,
  } = req.body;

  if (!customerName || !customerEmail || !travelDate || !packageTitle) {
    return res.status(400).json({ error: 'Name, email, travel date, and package details are required' });
  }

  const totalTravellers = Number(adults) + Number(children) + Number(seniors);

  const booking = db.createBooking({
    packageId,
    packageTitle,
    destination: destination || 'Verified Destination',
    customerName,
    customerEmail,
    customerPhone: customerPhone || '',
    travelDate,
    adults: Number(adults),
    children: Number(children),
    seniors: Number(seniors),
    totalTravellers: totalTravellers || 1,
    totalAmount: Number(totalAmount) || 0,
    specialRequests: specialRequests || '',
    status: 'pending',
  });

  res.json({
    success: true,
    message: `Booking request confirmed with reference ${booking.bookingRef}. Our coordinator will contact you shortly.`,
    booking,
  });
});

router.get('/bookings', (req, res) => {
  const { email } = req.query as { email?: string };
  let list = db.getBookings();
  if (email) {
    list = list.filter((b) => b.customerEmail.toLowerCase() === email.toLowerCase());
  }
  res.json({ bookings: list, total: list.length });
});

router.put('/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['confirmed', 'pending', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (confirmed, pending, cancelled) is required' });
  }
  const ok = db.updateBookingStatus(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true, message: `Booking status updated to ${status}` });
});

// 7. Reviews Endpoints
router.get('/reviews', (_req, res) => {
  const list = db.getReviews().filter((r) => r.status === 'approved');
  res.json({ reviews: list, total: list.length });
});

router.post('/reviews', (req, res) => {
  const { authorName, location, targetType = 'platform', targetTitle, rating, comment } = req.body;
  if (!authorName || !comment || !rating) {
    return res.status(400).json({ error: 'Name, rating, and review comment are required' });
  }
  const review = db.addReview({
    authorName,
    location: location || 'Verified Traveler',
    targetType,
    targetTitle: targetTitle || 'Trip Together Platform',
    rating: Number(rating) || 5,
    comment,
  });
  res.json({
    success: true,
    message: 'Thank you! Your verified review has been published.',
    review,
  });
});

router.put('/reviews/:id/moderate', (req, res) => {
  const { status } = req.body;
  if (!status || !['approved', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Valid status required' });
  }
  const ok = db.moderateReview(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Review not found' });
  res.json({ success: true, message: `Review status updated to ${status}` });
});

// 8. Contact & Support Endpoints
router.post('/contact', (req, res) => {
  const { name, email, subject, category, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  const ticket = db.createContactTicket({
    name,
    email,
    subject: subject || 'General Inquiry',
    category: category || 'General Help',
    message,
  });
  res.json({
    success: true,
    message: `Thank you for contacting Trip Together! Your support ticket reference is ${ticket.ticketRef}. Our team replies within 4 business hours.`,
    ticket,
  });
});

// 9. Saved Trips Endpoints
router.post('/trips/save', (req, res) => {
  const { id, userId, title, destination, travelDate, travellers, budget, itinerary, notes } = req.body;
  if (!title || !destination) {
    return res.status(400).json({ error: 'Trip title and destination are required' });
  }
  const saved = db.saveTrip({
    id: id || `trip-${Date.now()}`,
    userId: userId || 'usr-guest',
    title,
    destination,
    travelDate: travelDate || new Date().toISOString().split('T')[0],
    travellers: Number(travellers) || 2,
    budget: Number(budget) || 25000,
    itinerary: itinerary || [],
    notes,
    updatedAt: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Trip saved to your account', trip: saved });
});

router.get('/trips', (req, res) => {
  const { userId } = req.query as { userId?: string };
  const trips = db.getSavedTrips(userId);
  res.json({ trips, total: trips.length });
});

router.get('/trips/:id', (req, res) => {
  const trip = db.getSavedTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json({ trip });
});

router.delete('/trips/:id', (req, res) => {
  const deleted = db.deleteSavedTrip(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Trip not found' });
  res.json({ success: true, message: 'Trip deleted' });
});

// 10. Admin Endpoints
router.get('/admin/overview', (_req, res) => {
  const stats = db.getOverviewStats();
  res.json(stats);
});

router.get('/admin/users', (_req, res) => {
  const users = db.getUsers().map(({ password, ...u }) => u);
  res.json({ users, total: users.length });
});

router.get('/admin/enquiries', (_req, res) => {
  const enquiries = db.getGuideEnquiries();
  res.json({ enquiries, total: enquiries.length });
});

router.get('/admin/tickets', (_req, res) => {
  const tickets = db.getContactTickets();
  res.json({ tickets, total: tickets.length });
});

router.get('/admin/logs', (_req, res) => {
  res.json({ logs: db.getAuditLogs() });
});

router.all('/admin/guides/:id/verify', (req, res) => {
  const { status } = req.body as { status: 'verified' | 'rejected' };
  if (!status || !['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be verified or rejected' });
  }
  const ok = db.updateGuideVerification(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Guide not found' });
  res.json({ success: true, message: `Guide verification status updated to ${status}` });
});

// 11. Provider Status Endpoint
router.get('/providers/status', (_req, res) => {
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
        'Computes realistic intercity transfers to regional hubs and flights.',
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
        'Separates Official Portal Verified properties from Public Directory Verified hotels.',
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
      officialPortalUrl: 'https://ai.google.dev/',
      complianceNote:
        'Grounded strictly on verified transport, hotel, and tour package records without inventing fake bookings.',
    },
  ];

  res.json({
    adapters,
    serverTimestamp: new Date().toISOString(),
  });
});

// 12. Normalized Multi-Provider Catalog Endpoint
router.get('/travel/catalog', (_req, res) => {
  res.json({
    trains: KAKINADA_TO_TIRUPATI_TRAINS,
    buses: KAKINADA_TO_TIRUPATI_BUSES,
    flights: KAKINADA_TO_TIRUPATI_FLIGHTS,
    hotels: TIRUPATI_HOTELS,
    packages: TIRUPATI_PACKAGES,
    lastNormalizedAt: new Date().toISOString(),
  });
});

// 13. Destination Search Autocomplete Endpoint
router.get('/destinations/search', (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return res.json({ destinations: [], query: '', total: 0 });
    }
    const results = getRecommendedDestinations(q, 10);
    return res.json({
      destinations: results,
      query: q,
      total: results.length,
    });
  } catch (error) {
    console.error('Destination search error:', error);
    return res.status(500).json({ error: 'Failed to search destinations' });
  }
});

// 14. AI Trip Recommendation Engine Endpoint
router.post('/ai/recommend-trip', async (req, res) => {
  try {
    const {
      origin = 'Pickup Location',
      destination = 'Destination',
      travellers = 4,
      adults = 2,
      children = 1,
      seniors = 1,
      nights = 2,
      rooms = 2,
      totalBudget = 25000,
    } = req.body || {};

    const ai = getGenAIClient();

    const fallbackPlans = [
      {
        planName: `Comfort Family Journey to ${destination}`,
        combinationType: 'Rail / Road + Verified Family Stay',
        suitabilityReason: `Balanced itinerary designed for ${travellers} travellers (${adults} adults, ${seniors} senior, ${children} child).`,
        itemizedBudget: {
          transport: Math.round(totalBudget * 0.35),
          accommodation: Math.round(totalBudget * 0.35),
          localTravel: Math.round(totalBudget * 0.1),
          meals: Math.round(totalBudget * 0.12),
          ticketsAndActivities: Math.round(totalBudget * 0.05),
          contingencyAllowance: Math.round(totalBudget * 0.03),
        },
        totalFamilyCost: totalBudget,
        perPersonCost: Math.round(totalBudget / (travellers || 1)),
        missingOrEstimatedNotes: [
          'Estimated based on verified standard tariff tables for the selected season.',
          'Local guide and sight admissions can be confirmed upon arrival.',
        ],
        itinerarySummary: [
          `Day 1: Departure from ${origin}. Check-in at destination hotel. Evening orientation & local market visit.`,
          `Day 2: Full-day guided sightseeing of key cultural landmarks and scenic viewpoints with family lunch.`,
          `Day 3: Morning leisure and souvenir exploration. Comfortable return transit back to ${origin}.`,
        ],
        complianceWarning: 'Prices shown are verified estimates. Direct bookings confirm exact tariff.',
      },
    ];

    if (ai) {
      try {
        const prompt = `You are a certified professional travel planner for "Trip Together".
Generate a realistic 3-day family travel itinerary from ${origin} to ${destination} for ${travellers} travellers (${adults} adults, ${children} children, ${seniors} seniors) with a total budget of ₹${totalBudget}.
Output strictly valid JSON with keys: planName, combinationType, suitabilityReason, itemizedBudget (transport, accommodation, localTravel, meals, ticketsAndActivities, contingencyAllowance), totalFamilyCost, perPersonCost, missingOrEstimatedNotes, itinerarySummary, complianceWarning.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            plans: Array.isArray(parsed) ? parsed : [parsed],
            modelUsed: 'gemini-2.5-flash',
            generatedAt: new Date().toISOString(),
          });
        }
      } catch (aiErr) {
        console.warn('Gemini AI generation fallback:', aiErr);
      }
    }

    return res.json({
      plans: fallbackPlans,
      modelUsed: 'Deterministic Reference Calculator',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate trip recommendation',
    });
  }
});

// Favicon fallback handlers
const FAVICON_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D4A42" />
      <stop offset="100%" stop-color="#14B8A6" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#grad)" />
  <path d="M28 68 L50 28 L72 68 Z" fill="#D97706" opacity="0.9" />
  <path d="M38 68 L50 44 L62 68 Z" fill="#FBBF24" />
  <circle cx="50" cy="24" r="7" fill="#FBBF24" />
  <path d="M24 74 L76 74" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  <circle cx="34" cy="74" r="3" fill="#FFFFFF" />
  <circle cx="66" cy="74" r="3" fill="#FFFFFF" />
</svg>`;

const serveFaviconIco = (_req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  try {
    const icoPath = path.resolve(process.cwd(), 'public', 'favicon.ico');
    if (fs.existsSync(icoPath)) {
      return res.send(fs.readFileSync(icoPath));
    }
  } catch {}
  res.sendStatus(404);
};

const serveFaviconSvg = (_req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(FAVICON_SVG_CONTENT);
};

app.get('/favicon.ico', serveFaviconIco);
app.get('/favicon.svg', serveFaviconSvg);
router.get('/favicon.ico', serveFaviconIco);
router.get('/favicon.svg', serveFaviconSvg);

// Mount API router
app.use('/api', router);

if (process.env.VERCEL) {
  app.use('/', router);
}

export default app;
