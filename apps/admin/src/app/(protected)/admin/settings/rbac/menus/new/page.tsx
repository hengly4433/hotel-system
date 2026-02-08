"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert } from "@mui/material";
import MenuForm, { MenuFormData } from "../MenuForm";

export default function NewMenuPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (form: MenuFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      key: form.key,
      label: form.label,
      sortOrder: Number(form.sortOrder || 0)
    };

    try {
      await apiJson("rbac/menus", {
        method: "POST",
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

  return (
    <Box component="main">
      <PageHeader
        title="New Menu"
        subtitle="Create a new top-level navigation group"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MenuForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
