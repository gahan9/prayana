"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { signInWithGoogle, loading, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.replace("/trips");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-8">Sign in to access your trips.</p>
        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full"
        >
          Sign in with Google
        </Button>
        <p className="text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            Get started
          </Link>
        </p>
      </Card>
    </div>
  );
}
