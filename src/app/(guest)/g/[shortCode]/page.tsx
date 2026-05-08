"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGuestPlan } from "@/lib/guest-session";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { GuestPlan } from "@/types";

export default function GuestPlanPage() {
  const params = useParams<{ shortCode: string }>();
  const [plan, setPlan] = useState<GuestPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function load() {
      if (!params?.shortCode) return;
      const data = await getGuestPlan(params.shortCode);
      if (!data) {
        setExpired(true);
      } else {
        setPlan(data);
      }
      setLoading(false);
    }
    load();
  }, [params.shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading plan...</p>
      </div>
    );
  }

  if (expired || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="text-center max-w-sm">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Plan Expired</h1>
          <p className="text-gray-500 text-sm mb-6">
            Guest plans are available for 3 days. This one has expired.
          </p>
          <Link href="/quick">
            <Button>Create a New Quick Plan</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const expiresIn = Math.max(
    0,
    Math.ceil((plan.expiresAt.toMillis() - Date.now()) / 3600000),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Quick Plan</h1>
            <p className="text-sm text-gray-400">
              Expires in {expiresIn}h &middot; Code: {plan.shortCode}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            Copy Link
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {plan.plan.map((item, idx) => (
            <Card key={idx}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  {item.locationName && (
                    <p className="text-sm text-gray-500">{item.locationName}</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.category && (
                  <span className="inline-block rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-xs font-medium shrink-0 ml-4">
                    {item.category}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="text-center bg-brand-50 border-brand-100">
          <p className="text-brand-700 font-medium mb-3">
            Want to save this plan permanently?
          </p>
          <Link href="/login">
            <Button>Sign in to Save</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
