"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const { signInWithGoogle, loading, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.replace("/trips");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-500 text-sm mb-8">
          Start planning unforgettable trips with Prayana.
        </p>
        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full"
        >
          Sign up with Google
        </Button>
        <p className="text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
