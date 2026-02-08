"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import PropertyForm, { PropertyFormData } from "../PropertyForm";

type Organization = {
  id: string;
  name: string;
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const orgsData = await apiJson<Organization[]>("organizations");
      setOrganizations(orgsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: PropertyFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      organizationId: form.organizationId,
      name: form.name,
      timezone: form.timezone || null,
      currency: form.currency || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null
    };

    try {
      await apiJson("properties", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push("/admin/settings/properties");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/properties");
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
        title="New Property"
        subtitle="Add a new hotel property"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <PropertyForm
        organizations={organizations}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
