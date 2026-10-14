# Trip-together

> **TripTogether** is an AI-powered, collaborative family travel planner built with React 19, TypeScript, Express, Tailwind CSS, and Google Gemini 3.8 Flash. It enables families and travel groups to compare multi-modal transport (trains, buses, flights, cabs), explore budget-verified hotels & tour packages, generate grounded AI itineraries, and collaborate in real-time with family chat, polls, packing checklists, and live location sharing.

---

## 🌟 Key Features

- **🚆 Multi-Modal Transport Comparison**:
  - Compare realistic trains (IRCTC / Indian Railways), sleeper/semi-sleeper buses (APSRTC / redBus), regional flights (Amadeus), and private outstation cabs.
  - Transparent pricing breakdowns with base fares, taxes, dynamic surge allowances, and official portal deep links.

- **🏨 Verified Hospitality Directory**:
  - TTD Devasthanams official pilgrim guest houses (Srinivasam Complex, Madhavam Guest House).
  - APTDC Haritha Tourism verified resorts & hotels.
  - Verified commercial hotels with distance indicators to Tirumala Ghat Road and Alipiri gate.

- **🤖 Grounded AI Trip Recommendation Engine**:
  - Powered by **Gemini 3.8 Flash** via `@google/genai`.
  - Itemized budget calculations with contingency allowances, age-specific fare rules, and day-by-day itineraries.
  - Never hallucinates availability or fake confirmed darshan slots.

- **👨‍👩‍👧‍👦 Family Collaboration Hub**:
  - **Family Chat & Voting**: Discuss preferences and cast votes on travel dates and routes.
  - **Shared Checklist**: Collaborative packing checklist with assigned family members and categories.
  - **Split Budget Calculator**: Fair expense splitting per person or family unit with settlement summaries.
  - **Live Family Tracker**: Consent-based live geolocation sharing with customizable emergency contacts and safety status.

- **🔐 Dual Authentication**:
  - Instant One-Click Guest Mode.
  - Secure Email & Password login with session persistence.

---

## 🚀 Live Deployment on Vercel

This application is fully optimized for **zero-config deployment on Vercel** as a hybrid Vite Single Page Application + Express Serverless API.

### Option 1: Deploy with Vercel Git Integration (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **"Import Git Repository"** and select `madhurimadhu039/Trip-together`.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - *(Optional external adapters)*: `IRCTC_RAPIDAPI_KEY`, `REDBUS_PARTNER_API_KEY`, `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `HOTELBEDS_API_KEY`.
5. Click **"Deploy"**. Vercel will build the frontend assets and automatically serve the API via `api/index.ts`.

### Option 2: Deploy via Vercel CLI

```bash
# 1. Install or run Vercel CLI
npx vercel

# 2. Follow prompts to link project and deploy
# For production deployment:
npx vercel --prod
```

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/madhurimadhu039/Trip-together.git
cd Trip-together
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```
*(You can copy `.env.example` as a template)*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production locally
```bash
npm run build
npm start
```

---

## 📁 Project Architecture

```
Trip-together/
├── api/
│   └── index.ts               # Vercel Serverless Function entry point
├── src/
│   ├── components/            # Interactive React components
│   │   ├── AIRecommendationSection.tsx
│   │   ├── FamilyTrackingSection.tsx
│   │   ├── MultiModalComparisonSection.tsx
│   │   ├── TripBuilderSection.tsx
│   │   └── ...
│   ├── data.ts                # Verified transport & hotel catalog
│   ├── App.tsx                # Main application component
│   └── index.css              # Styling & design system tokens
├── server.ts                  # Express API backend with Gemini integration
├── vercel.json                # Vercel deployment routing & rewrites
├── vite.config.ts             # Vite configuration
└── package.json               # Dependencies and scripts
```

---

## 📄 License
MIT License. Built for collaborative family travel.
