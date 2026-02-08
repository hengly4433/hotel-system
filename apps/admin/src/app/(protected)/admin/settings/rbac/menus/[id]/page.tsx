"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import MenuForm, { MenuFormData } from "../MenuForm";

type RbacMenu = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
};

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.id as string;

  const [menu, setMenu] = useState<RbacMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<RbacMenu>(`rbac/menus/${menuId}`);
      setMenu(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: MenuFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      label: form.label,
      sortOrder: Number(form.sortOrder || 0)
    };

    try {
      await apiJson(`rbac/menus/${menuId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      router.push("/admin/settings/rbac/menus");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/rbac/menus");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!menu) {
    return (
      <Box component="main">
        <PageHeader title="Edit Menu" subtitle="Update menu details" />
        <Alert severity="error">Menu not found</Alert>
      </Box>
    );
  }

  const initialData: MenuFormData = {
    key: menu.key,
    label: menu.label,
    sortOrder: String(menu.sortOrder ?? 0)
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit Menu"
        subtitle={`Update: ${menu.label}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MenuForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
