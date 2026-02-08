"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import TimesheetForm, { TimesheetFormData } from "../TimesheetForm";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress, Stack } from "@mui/material";

type Property = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  propertyId: string;
};

function toIsoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function NewTimesheetPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [propertiesData, employeesData] = await Promise.all([
          apiJson<Property[]>("properties"),
          apiJson<Employee[]>("employees"),
        ]);
        setProperties(propertiesData);
        setEmployees(employeesData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  async function handleSubmit(form: TimesheetFormData) {
    setError(null);
    setIsSubmitting(true);

    const payload = {
      propertyId: form.propertyId,
      employeeId: form.employeeId,
      workDate: form.workDate,
      shift: form.shift,
      clockIn: toIsoOrNull(form.clockIn),
      clockOut: toIsoOrNull(form.clockOut),
      breakMinutes: form.breakMinutes ? Number(form.breakMinutes) : 0,
      status: form.status,
      notes: form.notes || null,
    };

    try {
      await apiJson("timesheets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/timesheets");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push("/admin/timesheets");
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader
        title="New Timesheet"
        subtitle="Create a new time entry"
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TimesheetForm
          properties={properties}
          employees={employees}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </Box>
  );
}
