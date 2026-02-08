"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import UserForm, { UserFormData } from "../UserForm";

type Role = {
  id: string;
  name: string;
};

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const rolesData = await apiJson<Role[]>("rbac/roles");
      setRoles(rolesData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: UserFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      email: form.email,
      password: form.password,
      status: form.status,
      propertyId: form.propertyId || null,
      roleIds: form.roleIds
    };

    try {
      await apiJson("rbac/users", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push("/admin/settings/rbac/users");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/settings/rbac/users");
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
        title="New User"
        subtitle="Create a new system user account"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <UserForm
        roles={roles}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </Box>
  );
}
