"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert } from "@mui/material";
import PermissionForm, { PermissionFormData } from "../PermissionForm";

export default function NewPermissionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (form: PermissionFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      resource: form.resource,
      action: form.action,
      scope: form.scope || null
    };

    try {
      await apiJson("rbac/permissions", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push("/admin/settings/rbac/permissions");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/rbac/permissions");
  };

  return (
    <Box component="main">
      <PageHeader
        title="New Permission"
        subtitle="Define a new granular access rule"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <PermissionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
