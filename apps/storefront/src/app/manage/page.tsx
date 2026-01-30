"use client";

import { useEffect, useState } from "react";
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

export default function ManageBookingPage() {
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
    <main style={{ padding: "0 6vw 64px" }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Manage your booking</h2>
        <p style={{ color: "rgba(28, 42, 45, 0.7)" }}>
          Enter your confirmation code and email to view or cancel your stay.
        </p>
      </div>

      <form onSubmit={handleLookup} className="card grid" style={{ gap: 16, marginBottom: 24 }}>
        {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
        <label className="grid" style={{ gap: 6 }}>
          <span>Confirmation code</span>
          <input className="input" value={code} onChange={(event) => setCode(event.target.value)} required />
        </label>
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
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Find booking"}
        </button>
      </form>

      {reservation ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Reservation {reservation.code}</h3>
          <p>Status: {reservation.status}</p>
          <p>
            {reservation.checkInDate} → {reservation.checkOutDate}
          </p>
          <p>Rooms: {reservation.rooms.length}</p>
          {reservation.status === "CANCELLED" ? (
            <p>Your booking has been cancelled.</p>
          ) : (
            <button className="btn secondary" type="button" onClick={handleCancel} disabled={loading}>
              Cancel reservation
            </button>
          )}
        </div>
      ) : null}
    </main>
  );
}
