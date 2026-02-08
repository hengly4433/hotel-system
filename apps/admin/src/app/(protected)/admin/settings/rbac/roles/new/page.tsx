"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert } from "@mui/material";
import RoleForm, { RoleFormData } from "../RoleForm";

export default function NewRolePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (form: RoleFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: form.name,
      propertyId: form.propertyId || null
    };

    try {
      await apiJson("rbac/roles", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push("/admin/settings/rbac/roles");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/rbac/roles");
  };

  return (
    <Box component="main">
      <PageHeader
        title="New Role"
        subtitle="Create a new access profile"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <RoleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
