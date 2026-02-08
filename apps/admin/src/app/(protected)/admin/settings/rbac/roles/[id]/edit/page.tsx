"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import RoleForm, { RoleFormData } from "../../RoleForm";

type RbacRole = {
  id: string;
  name: string;
  propertyId: string | null;
};

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<RbacRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<RbacRole>(`rbac/roles/${roleId}`);
      setRole(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: RoleFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: form.name,
      propertyId: form.propertyId || null
    };

    try {
      await apiJson(`rbac/roles/${roleId}`, {
        method: "PUT",
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!role) {
    return (
      <Box component="main">
        <PageHeader title="Edit Role" subtitle="Update role details" />
        <Alert severity="error">Role not found</Alert>
      </Box>
    );
  }

  const initialData: RoleFormData = {
    name: role.name,
    propertyId: role.propertyId || ""
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit Role"
        subtitle={`Update details for ${role.name}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <RoleForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
