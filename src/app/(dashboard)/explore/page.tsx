import { Card } from "@/components/ui/Card";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore Destinations</h1>
        <p className="text-gray-500 mb-8">
          Discover amazing places around the world.
        </p>
        <Card className="text-center py-16">
          <p className="text-gray-400">
            Destination catalogue coming soon. Use the Wizard or Chat to plan a trip now.
          </p>
        </Card>
      </div>
    </div>
  );
}
