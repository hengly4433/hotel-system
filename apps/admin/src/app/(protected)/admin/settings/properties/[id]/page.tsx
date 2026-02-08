"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import PropertyForm, { PropertyFormData } from "../PropertyForm";

type Organization = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  organizationId: string;
  name: string;
  timezone: string | null;
  currency: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [propertyData, orgsData] = await Promise.all([
        apiJson<Property>(`properties/${propertyId}`),
        apiJson<Organization[]>("organizations")
      ]);
      setProperty(propertyData);
      setOrganizations(orgsData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

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
      await apiJson(`properties/${propertyId}`, {
        method: "PUT",
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

  if (!property) {
    return (
      <Box component="main">
        <PageHeader title="Edit Property" subtitle="Update property details" />
        <Alert severity="error">Property not found</Alert>
      </Box>
    );
  }

  const initialData: PropertyFormData = {
    organizationId: property.organizationId,
    name: property.name,
    timezone: property.timezone || "",
    currency: property.currency || "",
    addressLine1: property.addressLine1 || "",
    addressLine2: property.addressLine2 || "",
    city: property.city || "",
    state: property.state || "",
    postalCode: property.postalCode || "",
    country: property.country || ""
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit Property"
        subtitle={`Update: ${property.name}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <PropertyForm
        initialData={initialData}
        organizations={organizations}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
