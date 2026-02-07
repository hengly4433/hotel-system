"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setCustomerToken } from "@/lib/customerAuth";

function safeRedirect(value: string | null) {
  if (!value) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

function GoogleCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const error = params.get("error");
  const redirect = safeRedirect(params.get("redirect"));

  useEffect(() => {
    if (token) {
      setCustomerToken(token);
      router.replace(redirect);
    }
  }, [token, redirect, router]);

  if (error) {
    return (
      <main>
        <div className="auth-wrapper">
          <div className="auth-brand">
            <Link href="/" className="auth-brand-logo">Sky High Hotel</Link>
          </div>
          <div className="auth-card-standalone" style={{ textAlign: "center" }}>
            <h1>Sign-in failed</h1>
            <p className="auth-subtitle">{error}</p>
            <Link className="auth-btn auth-btn-primary" href="/auth/sign-in">
              Try again
            </Link>
          </div>
          <Link href="/" className="auth-back-link">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main>
        <div className="auth-wrapper">
          <div className="auth-brand">
            <Link href="/" className="auth-brand-logo">Sky High Hotel</Link>
          </div>
          <div className="auth-card-standalone" style={{ textAlign: "center" }}>
            <h1>Unable to complete sign-in</h1>
            <p className="auth-subtitle">Please try again.</p>
            <Link className="auth-btn auth-btn-primary" href="/auth/sign-in">
              Return to sign in
            </Link>
          </div>
          <Link href="/" className="auth-back-link">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="auth-wrapper">
        <div className="auth-brand">
          <Link href="/" className="auth-brand-logo">Sky High Hotel</Link>
        </div>
        <div className="auth-card-standalone" style={{ textAlign: "center" }}>
          <h1>Signing you in...</h1>
          <p className="auth-subtitle">Please wait while we complete your login.</p>
        </div>
      </div>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="auth-wrapper"><div className="auth-card-standalone"><p>Loading...</p></div></div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
