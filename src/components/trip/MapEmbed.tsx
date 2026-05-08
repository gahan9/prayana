"use client";

interface MapEmbedProps {
  query: string;
  className?: string;
}

/**
 * Maps Embed API wrapper -- simple and reliable.
 * Restored to Iframe to ensure immediate build success for rapid iteration.
 */
export function MapEmbed({ query, className = "" }: MapEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_EMBED_API_KEY;

  if (!apiKey) {
    return (
      <div
        className={`rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={{ minHeight: 300 }}
      >
        Map preview unavailable (API key not configured)
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}`;

  return (
    <iframe
      src={src}
      className={`rounded-xl border-0 w-full ${className}`}
      style={{ minHeight: 300 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Map of ${query}`}
    />
  );
}
