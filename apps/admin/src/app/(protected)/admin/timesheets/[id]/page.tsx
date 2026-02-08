"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

type Timesheet = {
  id: string;
  propertyId: string;
  employeeId: string;
  workDate: string;
  shift: string;
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  status: string;
  notes: string | null;
};

function toDateTimeInput(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function EditTimesheetPage() {
  const router = useRouter();
  const params = useParams();
  const timesheetId = params.id as string;

  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [timesheetData, propertiesData, employeesData] = await Promise.all([
          apiJson<Timesheet>(`timesheets/${timesheetId}`),
          apiJson<Property[]>("properties"),
          apiJson<Employee[]>("employees"),
        ]);
        setTimesheet(timesheetData);
        setProperties(propertiesData);
        setEmployees(employeesData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [timesheetId]);

  function timesheetToFormData(t: Timesheet): TimesheetFormData {
    return {
      propertyId: t.propertyId,
      employeeId: t.employeeId,
      workDate: t.workDate,
      shift: t.shift,
      clockIn: toDateTimeInput(t.clockIn),
      clockOut: toDateTimeInput(t.clockOut),
      breakMinutes: String(t.breakMinutes ?? 0),
      status: t.status || "OPEN",
      notes: t.notes || "",
    };
  }

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
      await apiJson(`timesheets/${timesheetId}`, {
        method: "PUT",
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

  if (!timesheet) {
    return (
      <Box component="main">
        <PageHeader title="Edit Timesheet" subtitle="Timesheet not found" />
        <Alert severity="error">Timesheet not found</Alert>
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader
        title="Edit Timesheet"
        subtitle="Update timesheet details"
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TimesheetForm
          initialData={timesheetToFormData(timesheet)}
          properties={properties}
          employees={employees}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing
          isSubmitting={isSubmitting}
        />
      </Stack>
    </Box>
  );
}
