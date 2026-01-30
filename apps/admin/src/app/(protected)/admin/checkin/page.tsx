"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

type Reservation = {
  id: string;
  code: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
};

export default function CheckInOutPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Reservation[]>("reservations");
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function handleCheckIn(id: string) {
    try {
      await apiJson(`reservations/${id}/checkin`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCheckOut(id: string) {
    try {
      await apiJson(`reservations/${id}/checkout`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main>
      <PageHeader title="Check-in / Check-out" subtitle="Process arrivals and departures" />
      {error ? <div style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div> : null}
      <div style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Code</th>
              <th>Status</th>
              <th>Dates</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td>{reservation.code}</td>
                <td>{reservation.status}</td>
                <td>
                  {reservation.checkInDate} → {reservation.checkOutDate}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => handleCheckIn(reservation.id)}
                    style={{ marginRight: 8 }}
                  >
                    Check-in
                  </button>
                  <button type="button" onClick={() => handleCheckOut(reservation.id)}>
                    Check-out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
