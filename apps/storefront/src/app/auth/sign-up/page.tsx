"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { setCustomerToken } from "@/lib/customerAuth";

type RegisterResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export default function SignUpPage() {
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
        throw new Error(text || "Unable to sign up");
      }
      const data = (await res.json()) as RegisterResponse;
      setCustomerToken(data.accessToken);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="section auth-section">
        <div className="container auth-shell">
          <div className="auth-panel">
            <span className="auth-badge">New here?</span>
            <h1>Create your Sky High Hotel account.</h1>
            <p>Register once to unlock faster bookings, manage your reservations, and receive stay updates.</p>
            <div className="auth-highlights">
              <div className="auth-highlight">
                <span className="auth-highlight-title">One profile</span>
                <span className="auth-highlight-text">Keep guest details ready for every stay.</span>
              </div>
              <div className="auth-highlight">
                <span className="auth-highlight-title">Clear timeline</span>
                <span className="auth-highlight-text">View upcoming stays and saved preferences.</span>
              </div>
            </div>
          </div>
          <div className="card auth-card">
            <div className="auth-card-header">
              <span className="auth-eyebrow">Create account</span>
              <h2>Get started in minutes</h2>
              <p>Use Google for a quick start or complete the form below.</p>
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
                <span>or sign up with email</span>
                <span />
              </div>
            )}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="two-col">
                <label className="grid" style={{ gap: 6 }}>
                  <span>First name</span>
                  <input
                    className="input"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </label>
                <label className="grid" style={{ gap: 6 }}>
                  <span>Last name</span>
                  <input
                    className="input"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </label>
              </div>
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
                <span>Phone (optional)</span>
                <input
                  className="input"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p style={{ marginTop: 16, marginBottom: 0 }}>
              Already have an account?{" "}
              <Link className="link-accent" href={`/auth/sign-in?redirect=${encodeURIComponent(redirect)}`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
