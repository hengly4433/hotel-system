"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import OrganizationForm, { OrganizationFormData } from "../OrganizationForm";

type Organization = {
  id: string;
  name: string;
};

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Organization>(`organizations/${orgId}`);
      setOrganization(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: OrganizationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiJson(`organizations/${orgId}`, {
        method: "PUT",
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Box component="main">
        <PageHeader title="Edit Organization" subtitle="Update organization details" />
        <Alert severity="error">Organization not found</Alert>
      </Box>
    );
  }

  const initialData: OrganizationFormData = {
    name: organization.name
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit Organization"
        subtitle={`Update: ${organization.name}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <OrganizationForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
