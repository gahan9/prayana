"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function TripsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <div className="flex gap-2">
            <Link href="/trips/new/wizard">
              <Button>New Trip (Wizard)</Button>
            </Link>
            <Link href="/trips/new/chat">
              <Button variant="secondary">New Trip (Chat)</Button>
            </Link>
          </div>
        </div>
        <Card className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No trips yet</p>
          <p className="text-gray-400 text-sm mb-6">
            Create your first trip using the AI Wizard or Chat planner.
          </p>
          <Link href="/trips/new/wizard">
            <Button>Plan Your First Trip</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
