"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

type Property = {
  id: string;
  name: string;
};

type AuditLog = {
  id: string;
  propertyId: string | null;
  actorUserId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  beforeJson: Record<string, unknown> | string | null;
  afterJson: Record<string, unknown> | string | null;
  requestId: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      const data = await apiJson<Property[]>("properties");
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const query = propertyId ? `?propertyId=${propertyId}` : "";
      const data = await apiJson<AuditLog[]>(`audit-logs${query}`);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProperties();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProperties]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  return (
    <main>
      <PageHeader title="Audit Logs" subtitle="Track changes across modules" />
      {error ? <div style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div> : null}

      <div style={{ background: "white", padding: 24, borderRadius: 10, marginBottom: 24 }}>
        <label>
          <div>Property</div>
          <select value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
            <option value="">All properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Time</th>
              <th>Entity</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <div>{log.entityType}</div>
                  <small style={{ color: "#64748b" }}>{log.entityId || "-"}</small>
                </td>
                <td>{log.action}</td>
                <td>{log.actorUserId || "-"}</td>
                <td>
                  <details>
                    <summary>View</summary>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#334155" }}>
                      {log.beforeJson
                        ? `Before: ${JSON.stringify(log.beforeJson, null, 2)}\n`
                        : "Before: -\n"}
                      {log.afterJson
                        ? `After: ${JSON.stringify(log.afterJson, null, 2)}`
                        : "After: -"}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ paddingTop: 12 }}>
                  No audit logs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
