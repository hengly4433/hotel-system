"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setCustomerToken } from "@/lib/customerAuth";

function safeRedirect(value: string | null) {
  if (!value) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export default function GoogleCallbackPage() {
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
        <section className="section auth-section">
          <div className="container auth-shell">
            <div className="card auth-card" style={{ margin: "0 auto" }}>
              <h2>Google sign-in failed</h2>
              <p>{error}</p>
              <Link className="btn btn-primary" href="/auth/sign-in">
                Return to sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main>
        <section className="section auth-section">
          <div className="container auth-shell">
            <div className="card auth-card" style={{ margin: "0 auto" }}>
              <h2>Unable to complete sign-in</h2>
              <p>Please try again.</p>
              <Link className="btn btn-primary" href="/auth/sign-in">
                Return to sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="section auth-section">
        <div className="container auth-shell">
          <div className="card auth-card" style={{ margin: "0 auto" }}>
            <h2>Signing you in...</h2>
            <p>Please wait while we finish your login.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
