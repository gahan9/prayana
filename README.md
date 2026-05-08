# Prayana

Travel Planning & Experience -- a Google-services-only PWA.

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

Next.js 14, React 18, TypeScript, Tailwind CSS, Firebase (Auth, Firestore, Storage, Hosting), Gemini API (AI Studio free tier), Maps Embed API.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for full system design, cost model, and service tier breakdown.

## License

MIT
