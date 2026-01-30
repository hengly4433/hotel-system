"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacPermission } from "@/lib/types/rbac";

const EMPTY_FORM = {
  resource: "",
  action: "",
  scope: ""
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const data = await apiJson<RbacPermission[]>("rbac/permissions");
      setPermissions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(permission: RbacPermission) {
    setEditingId(permission.id);
    setForm({
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope || ""
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      resource: form.resource,
      action: form.action,
      scope: form.scope || null
    };

    try {
      if (editingId) {
        await apiJson(`rbac/permissions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rbac/permissions", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(permissionId: string) {
    if (!confirm("Delete this permission?")) return;
    try {
      await apiJson(`rbac/permissions/${permissionId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main>
      <PageHeader title="Permissions" subtitle="Granular access rules" />

      <form
        onSubmit={handleSubmit}
        style={{ background: "white", padding: 24, borderRadius: 10, marginBottom: 24 }}
      >
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Permission" : "Create Permission"}</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Resource</div>
            <input
              value={form.resource}
              onChange={(e) => setForm({ ...form, resource: e.target.value })}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            <div>Action</div>
            <input
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            <div>Scope (optional)</div>
            <input
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "8px 14px", background: "#0f172a", color: "white", border: "none" }}
          >
            {loading ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} style={{ padding: "8px 14px" }}>
              Cancel
            </button>
          ) : null}
        </div>
        {error ? <div style={{ color: "#b91c1c", marginTop: 12 }}>{error}</div> : null}
      </form>

      <div style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Permissions</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Resource</th>
              <th>Action</th>
              <th>Scope</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td>{permission.resource}</td>
                <td>{permission.action}</td>
                <td>{permission.scope || "-"}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => startEdit(permission)}
                    style={{ marginRight: 8 }}
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(permission.id)}>
                    Delete
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
