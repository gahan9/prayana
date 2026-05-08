import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Planning & Experience",
  description:
    "Plan your next adventure with Prayana. Discover destinations, build smart itineraries, and share your travel experiences.",
};

const FEATURES = [
  {
    icon: "🗺️",
    title: "Smart Itineraries",
    description:
      "Build day-by-day travel plans with activities, transport, and accommodation all in one place.",
  },
  {
    icon: "🌍",
    title: "Discover Destinations",
    description:
      "Explore a curated catalogue of destinations worldwide with traveller ratings and reviews.",
  },
  {
    icon: "📸",
    title: "Share Experiences",
    description:
      "Document your journey with photos and stories. Inspire others with your adventures.",
  },
  {
    icon: "💰",
    title: "Budget Tracking",
    description:
      "Set a budget, track spending across categories, and travel confidently without surprises.",
  },
  {
    icon: "📱",
    title: "Works Offline",
    description:
      "Installed as a Progressive Web App, Prayana works even without internet on the go.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description:
      "Your trips are private by default. You choose what to share and with whom.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
              <span aria-hidden="true">✈️</span>
              <span>Prayana</span>
            </Link>
            <nav aria-label="Main navigation">
              <ul className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
                <li>
                  <Link href="/trips" className="hover:text-brand-600 transition-colors">
                    My Trips
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-600 transition-colors">
                    Explore
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-orange-50 to-amber-50 py-20 sm:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-4">
              Your travel companion
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Plan trips you&apos;ll{" "}
              <span className="text-brand-600">never forget</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Prayana brings together destination discovery, smart itinerary
              building, and experience sharing – all in a fast, offline-ready app.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors shadow-lg shadow-brand-200"
              >
                Start planning for free
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl text-base transition-colors border border-gray-200"
              >
                Browse destinations
              </Link>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          className="py-20 sm:py-28 bg-white"
          aria-labelledby="features-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2
                id="features-heading"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              >
                Everything you need to travel smarter
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Built for travellers by travellers. Prayana covers every stage
                of your journey.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((f) => (
                <li
                  key={f.title}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-4" aria-hidden="true">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-brand-600">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready for your next adventure?
            </h2>
            <p className="text-brand-100 text-lg mb-10">
              Join thousands of travellers already using Prayana to plan
              unforgettable trips.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-700 font-semibold px-8 py-3 rounded-xl text-base transition-colors shadow-lg"
            >
              Create your free account
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-white text-lg mb-3"
              >
                <span aria-hidden="true">✈️</span> Prayana
              </Link>
              <p className="text-sm">
                Travel planning and experience. Built with ❤️ using Firebase &
                Next.js.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">
                Product
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/explore" className="hover:text-white transition-colors">
                    Explore
                  </Link>
                </li>
                <li>
                  <Link href="/trips" className="hover:text-white transition-colors">
                    My Trips
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">
                Project
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/gahan9/prayana"
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/gahan9/prayana/blob/main/CONTRIBUTING.md"
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contribute
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © {new Date().getFullYear()} Prayana. MIT Licensed.
          </div>
        </div>
      </footer>
    </>
  );
}
