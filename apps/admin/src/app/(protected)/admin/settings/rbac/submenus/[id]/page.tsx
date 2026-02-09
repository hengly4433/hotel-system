"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import SubmenuForm, { SubmenuFormData } from "../SubmenuForm";

type Menu = {
  id: string;
  key: string;
  label: string;
};

type RbacSubmenu = {
  id: string;
  menuId: string;
  key: string;
  label: string;
  route: string;
  sortOrder: number;
};

export default function EditSubmenuPage() {
  const router = useRouter();
  const params = useParams();
  const submenuId = params.id as string;

  const [submenu, setSubmenu] = useState<RbacSubmenu | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [submenuData, menusData] = await Promise.all([
        apiJson<RbacSubmenu>(`rbac/submenus/${submenuId}`),
        apiJson<Menu[]>("rbac/menus")
      ]);
      setSubmenu(submenuData);
      setMenus(menusData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [submenuId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: SubmenuFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      menuId: form.menuId,
      label: form.label,
      route: form.route,
      sortOrder: Number(form.sortOrder || 0)
    };

    try {
      await apiJson(`rbac/submenus/${submenuId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      router.push("/admin/settings/rbac/submenus");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/rbac/submenus");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!submenu) {
    return (
      <Box component="main">
        <PageHeader title="Edit Submenu" subtitle="Update submenu details" />
        <Alert severity="error">Submenu not found</Alert>
      </Box>
    );
  }

  const initialData: SubmenuFormData = {
    menuId: submenu.menuId,
    key: submenu.key,
    label: submenu.label,
    route: submenu.route,
    sortOrder: String(submenu.sortOrder ?? 0)
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit Submenu"
        subtitle={`Update: ${submenu.label}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <SubmenuForm
        initialData={initialData}
        menus={menus}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
