"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Reservation = {
  id: string;
  code: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: Array<{
    roomTypeId: string;
    roomId: string | null;
    ratePlanId: string;
    guestsInRoom: number;
  }>;
};

async function fetchJson<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return (await res.json()) as T;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

function ManageBookingContent() {
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paramCode = params.get("code");
    if (paramCode && !code) {
      setCode(paramCode);
    }
  }, [params, code]);

  async function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await fetchJson<Reservation>(
        `/api/public/reservations/${encodeURIComponent(code)}?email=${encodeURIComponent(email)}`
      );
      setReservation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to find reservation");
      setReservation(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!reservation) return;
    if (!confirm("Cancel this reservation?")) return;
    setLoading(true);
    try {
      const data = await fetchJson<Reservation>(
        `/api/public/reservations/${encodeURIComponent(reservation.code)}/cancel?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      setReservation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel reservation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="manage-header-icon">🔍</div>
        <h2 style={{ marginTop: 8, marginBottom: 4 }}>Look up your booking</h2>
        <p style={{ color: "var(--ink-soft)", marginBottom: 0 }}>
          Enter your confirmation code and email to view or cancel your stay.
        </p>
      </div>

      <form onSubmit={handleLookup} className="card grid" style={{ gap: 16, marginBottom: 24 }}>
        {error ? <div className="auth-error-modern">{error}</div> : null}
        <label className="grid" style={{ gap: 6 }}>
          <span className="contact-label">Confirmation code</span>
          <input className="input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. RES-20260212-001" required />
        </label>
        <label className="grid" style={{ gap: 6 }}>
          <span className="contact-label">Email</span>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find booking"}
        </button>
      </form>

      {reservation ? (
        <div className="card manage-result-card">
          <div className="manage-result-header">
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>Reservation {reservation.code}</h3>
            <span className={`status-pill ${reservation.status === "CANCELLED" ? "sold" : "available"}`}>
              {reservation.status.replace("_", " ")}
            </span>
          </div>
          <div className="reservation-dates" style={{ marginTop: 16 }}>
            <div className="reservation-date-block">
              <span className="reservation-date-label">Check-in</span>
              <span className="reservation-date-value">{formatDate(reservation.checkInDate)}</span>
            </div>
            <span className="reservation-date-arrow">→</span>
            <div className="reservation-date-block">
              <span className="reservation-date-label">Check-out</span>
              <span className="reservation-date-value">{formatDate(reservation.checkOutDate)}</span>
            </div>
          </div>
          <div className="result-features" style={{ marginTop: 16 }}>
            <span className="result-feature-badge">🚪 {reservation.rooms.length} room(s)</span>
          </div>
          {reservation.status === "CANCELLED" ? (
            <div className="manage-cancelled-notice">
              <p style={{ margin: 0 }}>This booking has been cancelled.</p>
            </div>
          ) : (
            <button className="btn secondary" type="button" onClick={handleCancel} disabled={loading} style={{ marginTop: 20 }}>
              Cancel reservation
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero-badge">Booking Management</span>
          <h1>Manage Booking</h1>
          <p>View or cancel your reservation with your confirmation code.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Suspense fallback={<div className="empty-state">Loading...</div>}>
            <ManageBookingContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
