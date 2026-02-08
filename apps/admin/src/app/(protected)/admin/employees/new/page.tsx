"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import EmployeeForm, { EmployeeFormData } from "../EmployeeForm";

type Property = {
  id: string;
  name: string;
};

function skillsToInput(skills: string | null) {
  if (!skills) return "";
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
    return skills;
  } catch {
    return skills;
  }
}

function inputToSkills(value: string) {
  if (!value) return null;
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return JSON.stringify(items);
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProperties = useCallback(async () => {
    try {
      const data = await apiJson<Property[]>("properties");
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSubmit = async (form: EmployeeFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      firstName: form.firstName,
      lastName: form.lastName,
      dob: form.dob || null,
      phone: form.phone || null,
      email: form.email || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
      jobTitle: form.jobTitle || null,
      department: form.department || null,
      hireDate: form.hireDate || null,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      skills: inputToSkills(form.skills),
      photoUrl: form.photoUrl || null,
      employmentStatus: form.employmentStatus
    };

    try {
      await apiJson("employees", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push("/admin/employees");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/employees");
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
        title="New Employee"
        subtitle="Create a new staff profile"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <EmployeeForm
        properties={properties}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
