"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import PermissionForm, { PermissionFormData } from "../PermissionForm";

type RbacPermission = {
  id: string;
  resource: string;
  action: string;
  scope: string | null;
};

export default function EditPermissionPage() {
  const router = useRouter();
  const params = useParams();
  const permissionId = params.id as string;

  const [permission, setPermission] = useState<RbacPermission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<RbacPermission>(`rbac/permissions/${permissionId}`);
      setPermission(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [permissionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: PermissionFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      resource: form.resource,
      action: form.action,
      scope: form.scope || null
    };

    try {
      await apiJson(`rbac/permissions/${permissionId}`, {
        method: "PUT",
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!permission) {
    return (
      <Box component="main">
        <PageHeader title="Edit Permission" subtitle="Update permission details" />
        <Alert severity="error">Permission not found</Alert>
      </Box>
    );
  }

  const initialData: PermissionFormData = {
    resource: permission.resource,
    action: permission.action,
    scope: permission.scope || ""
  };

  return (
    <Box component="main">
      <PageHeader
        title="Edit Permission"
        subtitle={`Update: ${permission.resource}.${permission.action}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <PermissionForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
