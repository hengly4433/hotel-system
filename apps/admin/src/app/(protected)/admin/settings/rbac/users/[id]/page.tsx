"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import UserForm, { UserFormData } from "../UserForm";

type Role = {
  id: string;
  name: string;
};

type RbacUser = {
  id: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
  propertyId: string | null;
  roleIds: string[];
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<RbacUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [userData, rolesData] = await Promise.all([
        apiJson<RbacUser>(`rbac/users/${userId}`),
        apiJson<Role[]>("rbac/roles")
      ]);
      setUser(userData);
      setRoles(rolesData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: UserFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      email: form.email,
      status: form.status,
      propertyId: form.propertyId || null,
      roleIds: form.roleIds
    };

    if (form.newPassword) {
      payload.password = form.newPassword;
    }

    try {
      await apiJson(`rbac/users/${userId}`, {
        method: "PUT",
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

  if (!user) {
    return (
      <Box component="main">
        <PageHeader title="Edit User" subtitle="Update user details" />
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  const initialData: UserFormData = {
    email: user.email,
    password: "",
    newPassword: "",
    status: user.status,
    propertyId: user.propertyId || "",
    roleIds: user.roleIds || []
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit User"
        subtitle={`Update account for ${user.email}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <UserForm
        initialData={initialData}
        roles={roles}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
