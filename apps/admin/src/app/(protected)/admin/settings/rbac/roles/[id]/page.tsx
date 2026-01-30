"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { MenuTree, PermissionGroup, RbacRole } from "@/lib/types/rbac";

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params?.id as string | undefined;

  const [role, setRole] = useState<RbacRole | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [menuTree, setMenuTree] = useState<MenuTree[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [savingSubmenus, setSavingSubmenus] = useState(false);

  const permissionCount = useMemo(() => selectedPermissions.size, [selectedPermissions]);

  const loadData = useCallback(async () => {
    if (!roleId) return;
    setError(null);
    try {
      const [roleData, groupData, rolePermissionIds, roleMenuTree] = await Promise.all([
        apiJson<RbacRole>(`rbac/roles/${roleId}`),
        apiJson<PermissionGroup[]>("rbac/pickers/permissions-grouped"),
        apiJson<string[]>(`rbac/roles/${roleId}/permissions`),
        apiJson<MenuTree[]>(`rbac/roles/${roleId}/submenus`)
      ]);

      setRole(roleData);
      setPermissionGroups(groupData);
      setSelectedPermissions(new Set(rolePermissionIds));
      setMenuTree(roleMenuTree);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [roleId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function togglePermission(permissionId: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  }

  function toggleGroup(resource: string) {
    const group = permissionGroups.find((g) => g.resource === resource);
    if (!group) return;

    const ids = group.permissions.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissions.has(id));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleMenu(menuId: string) {
    setMenuTree((prev) =>
      prev.map((menu) => {
        if (menu.id !== menuId) return menu;
        const allChecked = menu.submenus.every((submenu) => submenu.checked);
        return {
          ...menu,
          submenus: menu.submenus.map((submenu) => ({
            ...submenu,
            checked: !allChecked
          }))
        };
      })
    );
  }

  function toggleSubmenu(menuId: string, submenuId: string) {
    setMenuTree((prev) =>
      prev.map((menu) => {
        if (menu.id !== menuId) return menu;
        return {
          ...menu,
          submenus: menu.submenus.map((submenu) =>
            submenu.id === submenuId
              ? { ...submenu, checked: !submenu.checked }
              : submenu
          )
        };
      })
    );
  }

  async function savePermissions() {
    if (!roleId) return;
    setSavingPermissions(true);
    setError(null);
    try {
      await apiJson(`rbac/roles/${roleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissionIds: Array.from(selectedPermissions) })
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingPermissions(false);
    }
  }

  async function saveSubmenus() {
    if (!roleId) return;
    setSavingSubmenus(true);
    setError(null);

    const submenuIds = menuTree
      .flatMap((menu) => menu.submenus)
      .filter((submenu) => submenu.checked)
      .map((submenu) => submenu.id);

    try {
      await apiJson(`rbac/roles/${roleId}/submenus`, {
        method: "PUT",
        body: JSON.stringify({ submenuIds })
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingSubmenus(false);
    }
  }

  if (!role) {
    return (
      <main>
        <PageHeader title="Role" subtitle="Loading..." />
        {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
      </main>
    );
  }

  return (
    <main>
      <PageHeader title={`Role: ${role.name}`} subtitle={`Permissions: ${permissionCount}`} />

      {error ? (
        <div style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div>
      ) : null}

      <section style={{ background: "white", padding: 24, borderRadius: 10, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Permissions</h3>
        {permissionGroups.map((group) => {
          const groupIds = group.permissions.map((p) => p.id);
          const allSelected = groupIds.every((id) => selectedPermissions.has(id));
          return (
            <div key={group.resource} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" onClick={() => toggleGroup(group.resource)}>
                  {allSelected ? "Unselect" : "Select"} {group.resource}
                </button>
                <span style={{ fontWeight: 600 }}>{group.resource}</span>
              </div>
              <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                {group.permissions.map((permission) => (
                  <label key={permission.id} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                    />
                    <span>
                      {permission.resource}.{permission.action}
                      {permission.scope ? `.${permission.scope}` : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={savePermissions}
          disabled={savingPermissions}
          style={{ padding: "8px 14px", background: "#0f172a", color: "white", border: "none" }}
        >
          {savingPermissions ? "Saving..." : "Save Permissions"}
        </button>
      </section>

      <section style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Menu Access</h3>
        {menuTree.map((menu) => (
          <div key={menu.id} style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, display: "flex", gap: 8 }}>
              <input
                type="checkbox"
                checked={menu.submenus.length > 0 && menu.submenus.every((sm) => sm.checked)}
                onChange={() => toggleMenu(menu.id)}
              />
              {menu.label}
            </label>
            <div style={{ marginLeft: 20, marginTop: 8, display: "grid", gap: 6 }}>
              {menu.submenus.map((submenu) => (
                <label key={submenu.id} style={{ display: "flex", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={submenu.checked}
                    onChange={() => toggleSubmenu(menu.id, submenu.id)}
                  />
                  <span>{submenu.label}</span>
                </label>
              ))}
              {menu.submenus.length === 0 ? (
                <div style={{ color: "#64748b" }}>No submenus</div>
              ) : null}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={saveSubmenus}
          disabled={savingSubmenus}
          style={{ padding: "8px 14px", background: "#0f172a", color: "white", border: "none" }}
        >
          {savingSubmenus ? "Saving..." : "Save Menu Access"}
        </button>
      </section>
    </main>
  );
}
