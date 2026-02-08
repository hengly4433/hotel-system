"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert } from "@mui/material";
import OrganizationForm, { OrganizationFormData } from "../OrganizationForm";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (form: OrganizationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiJson("organizations", {
        method: "POST",
        body: JSON.stringify(form)
      });
      router.push("/admin/settings/organizations");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/organizations");
  };

  return (
    <Box component="main">
      <PageHeader
        title="New Organization"
        subtitle="Create a new hotel group or chain"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <OrganizationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
