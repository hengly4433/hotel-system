"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { setCustomerToken } from "@/lib/customerAuth";

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export default function SignInPage() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get("redirect") || "/";
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const googleAuthHref = `/api/public/auth/google/start?redirect=${encodeURIComponent(redirect)}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Unable to sign in");
      }
      const data = (await res.json()) as LoginResponse;
      setCustomerToken(data.accessToken);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="section auth-section">
        <div className="container auth-shell">
          <div className="auth-panel">
            <span className="auth-badge">Customer access</span>
            <h1>Welcome back to Sky High Hotel.</h1>
            <p>Sign in to finish your reservation, manage your stays, and keep all your travel details in one place.</p>
            <div className="auth-highlights">
              <div className="auth-highlight">
                <span className="auth-highlight-title">Fast checkout</span>
                <span className="auth-highlight-text">Save guest details and resume bookings instantly.</span>
              </div>
              <div className="auth-highlight">
                <span className="auth-highlight-title">Stay updates</span>
                <span className="auth-highlight-text">Track reservation status and see what&apos;s next.</span>
              </div>
            </div>
          </div>
          <div className="card auth-card">
            <div className="auth-card-header">
              <span className="auth-eyebrow">Sign in</span>
              <h2>Continue your booking</h2>
              <p>Use your email or Google account to get started.</p>
            </div>
            {error && <div className="auth-error">{error}</div>}
            {googleEnabled && (
              <div className="auth-social">
                <Link className="btn btn-google" href={googleAuthHref}>
                  Continue with Google
                </Link>
              </div>
            )}
            {googleEnabled && (
              <div className="auth-divider">
                <span />
                <span>or sign in with email</span>
                <span />
              </div>
            )}
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="grid" style={{ gap: 6 }}>
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="grid" style={{ gap: 6 }}>
                <span>Password</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p style={{ marginTop: 16, marginBottom: 0 }}>
              New here?{" "}
              <Link className="link-accent" href={`/auth/sign-up?redirect=${encodeURIComponent(redirect)}`}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
