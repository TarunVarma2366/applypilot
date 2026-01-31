"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/applications");
  }

  async function handleSignUp() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is disabled, user is signed in immediately
    router.push("/applications");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-white/5 p-6 space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-transparent"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-transparent"
        />

        <p className="text-xs text-neutral-400">
          Password should be at least 6 characters.
        </p>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full rounded-md bg-white text-black px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full rounded-md border border-white/20 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Create account"}
        </button>

        <p className="text-sm text-neutral-400 text-center">
          You can sign in or create a new account using email and password.
        </p>
      </div>
    </main>
  );
}
