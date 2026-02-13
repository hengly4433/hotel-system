"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import GuestForm, { GuestFormData } from "@/components/guests/GuestForm";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";

export default function EditGuestPage() {
  const router = useRouter();
  const params = useParams();
  const guestId = params?.id as string;
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<GuestFormData | null>(null);

  useEffect(() => {
    async function loadGuest() {
      if (!guestId) return;
      try {
        const data = await apiJson<any>(`guests/${guestId}`);
        // Transform API data to form data
        setInitialData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dob: data.dob || "",
          phone: data.phone || "",
          email: data.email || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
          loyaltyTier: data.loyaltyTier || "NONE",
          notes: data.notes || "",
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadGuest();
  }, [guestId]);

  const handleSubmit = async (data: GuestFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        dob: data.dob || null,
        phone: data.phone || null,
        email: data.email || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        notes: data.notes || null,
      };

      await apiJson(`guests/${guestId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.push("/admin/guests");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !initialData) {
    return (
      <Box component="main">
        <PageHeader title="Edit Guest" subtitle="Update guest information" />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader title="Edit Guest" subtitle="Update guest information" />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {initialData && (
        <GuestForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      )}
    </Box>
  );
}
