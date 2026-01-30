"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildAuthHeaders, getCustomerToken } from "@/lib/customerAuth";

type ReservationRoomResponse = {
  id: string;
  roomTypeId: string;
  roomId: string | null;
  ratePlanId: string;
  guestsInRoom: number;
};

type ReservationResponse = {
  id: string;
  propertyId: string;
  primaryGuestId: string;
  code: string;
  status: string;
  channel: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  specialRequests: string | null;
  rooms: ReservationRoomResponse[];
};

async function fetchJson<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return (await res.json()) as T;
}

function statusTone(status: string) {
  const normalized = status.toUpperCase();
  if (["CONFIRMED", "CHECKED_IN"].includes(normalized)) return "available";
  if (["CANCELLED", "NO_SHOW"].includes(normalized)) return "sold";
  return "";
}

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push(`/auth/sign-in?redirect=${encodeURIComponent("/reservations")}`);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const data = await fetchJson<ReservationResponse[]>("/api/public/reservations/me", {
          headers: { ...buildAuthHeaders() }
        });
        if (!active) return;
        setReservations(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Unable to load reservations";
        const lower = message.toLowerCase();
        if (lower.includes("unauthorized") || lower.includes("auth") || lower.includes("sign in")) {
          router.push(`/auth/sign-in?redirect=${encodeURIComponent("/reservations")}`);
          return;
        }
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>My reservations</h2>
            <p style={{ color: "var(--ink-soft)" }}>
              Review your upcoming stays and reservation details.
            </p>
          </div>

          {loading && <div className="empty-state">Loading your reservations...</div>}

          {!loading && error && (
            <div className="card">
              <h3>Unable to load reservations</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && reservations.length === 0 && (
            <div className="empty-state">
              <p style={{ marginBottom: 16 }}>You don't have any reservations yet.</p>
              <Link className="btn btn-primary" href="/">
                Start a new booking
              </Link>
            </div>
          )}

          {!loading && !error && reservations.length > 0 && (
            <div className="results-grid">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="result-card">
                  <div className="result-body">
                    <div className="result-header">
                      <h3>Reservation #{reservation.code}</h3>
                      <span className={`status-pill ${statusTone(reservation.status)}`}>
                        {reservation.status.replace("_", " ")}
                      </span>
                    </div>
                    <p style={{ marginTop: 4 }}>
                      {reservation.checkInDate} → {reservation.checkOutDate}
                    </p>
                    <div className="result-meta">
                      <span>
                        {reservation.adults} adults · {reservation.children} children
                      </span>
                      <span>{reservation.rooms.length} room(s)</span>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span className="result-code">Channel: {reservation.channel}</span>
                      {reservation.specialRequests && (
                        <span className="result-code">Special requests noted</span>
                      )}
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Link className="btn btn-primary" href={`/manage?code=${reservation.code}`}>
                        Manage booking
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
