"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewSubmenuPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const menusData = await apiJson<Menu[]>("rbac/menus");
      setMenus(menusData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: SubmenuFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      menuId: form.menuId,
      key: form.key,
      label: form.label,
      route: form.route,
      sortOrder: Number(form.sortOrder || 0)
    };

    try {
      await apiJson("rbac/submenus", {
        method: "POST",
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

  return (
    <Box component="main">
      <PageHeader
        title="New Submenu"
        subtitle="Create a new navigation item under a menu"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <SubmenuForm
        menus={menus}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
