"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

type Folio = {
  id: string;
  reservationId: string;
  status: string;
  currency: string;
};

export default function FoliosPage() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Folio[]>("folios");
      setFolios(data);
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

  return (
    <main>
      <PageHeader title="Folios" subtitle="Balances and payments" />
      {error ? <div style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div> : null}
      <div style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Folio</th>
              <th>Reservation</th>
              <th>Status</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {folios.map((folio) => (
              <tr key={folio.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td>
                  <Link href={`/admin/finance/folios/${folio.id}`}>{folio.id}</Link>
                </td>
                <td>{folio.reservationId}</td>
                <td>{folio.status}</td>
                <td>{folio.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
