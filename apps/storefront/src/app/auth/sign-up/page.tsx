"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { setCustomerToken } from "@/lib/customerAuth";

type RegisterResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

function SignUpContent() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get("redirect") || "/";
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const googleAuthHref = `/api/public/auth/google/start?redirect=${encodeURIComponent(redirect)}`;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phone: phone || null })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Unable to create account");
      }
      const data = (await res.json()) as RegisterResponse;
      setCustomerToken(data.accessToken);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="auth-wrapper">
        <div className="auth-brand">
          <Link href="/" className="auth-brand-logo">Sky High Hotel</Link>
          <span className="auth-brand-tagline">Create your account</span>
        </div>

        <div className="auth-card-standalone">
          <h1>Get started</h1>
          <p className="auth-subtitle">
            Join us to unlock faster bookings and manage your reservations effortlessly.
          </p>

          {error && <div className="auth-error-modern">{error}</div>}

          {googleEnabled && (
            <>
              <Link className="auth-btn auth-btn-google" href={googleAuthHref}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Link>
              <div className="auth-divider-modern">or sign up with email</div>
            </>
          )}

          <form className="auth-form-modern" onSubmit={handleSubmit}>
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-btn auth-btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link href={`/auth/sign-in?redirect=${encodeURIComponent(redirect)}`}>
              Sign in
            </Link>
          </p>
        </div>

        <Link href="/" className="auth-back-link">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="auth-wrapper"><div className="auth-card-standalone"><p>Loading...</p></div></div>}>
      <SignUpContent />
    </Suspense>
  );
}
