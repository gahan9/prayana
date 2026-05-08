# Prayana

Travel Planning & Experience -- a Google-services-only PWA.

[![CI](https://github.com/gahan9/prayana/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gahan9/prayana/actions/workflows/ci.yml)
[![Security Scan](https://github.com/gahan9/prayana/actions/workflows/security-scan.yml/badge.svg?branch=main)](https://github.com/gahan9/prayana/actions/workflows/security-scan.yml)
[![Health Check](https://github.com/gahan9/prayana/actions/workflows/health-check.yml/badge.svg)](https://github.com/gahan9/prayana/actions/workflows/health-check.yml)
[![Deploy](https://github.com/gahan9/prayana/actions/workflows/deploy.yml/badge.svg)](https://github.com/gahan9/prayana/actions/workflows/deploy.yml)

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env.local

# Start dev server
npm run dev

# Run with Firebase emulators
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npm run dev
npm run firebase:emulators
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase project config |
| `GEMINI_API_KEY` | No | Gemini API key (AI Studio). Mock data used when absent. |
| `NEXT_PUBLIC_MAPS_EMBED_API_KEY` | No | Google Maps Embed API key. Map placeholder shown when absent. |

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in with Google |
| `/register` | Create account |
| `/trips` | Trip list (authenticated) |
| `/trips/new/wizard` | AI wizard trip planner |
| `/trips/new/chat` | AI chat trip planner |
| `/trips/[tripId]` | Trip detail with timeline, map, budget |
| `/trips/demo` | Demo trip with mock data |
| `/explore` | Destination discovery |
| `/deals` | Deals and bank offers |
| `/quick` | Guest quick plan (GPS-based) |
| `/g/[shortCode]` | Shared guest plan (3-day expiry) |

## Tech Stack

Next.js 14, React 18, TypeScript, Tailwind CSS, Firebase (Auth, Firestore, Storage, Hosting, Performance, Analytics), Vertex AI (Google Cloud), BigQuery (Analytics), Cloud Functions Gen 2, Maps Embed API.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for full system design, cost model, and service tier breakdown.

## License

MIT
