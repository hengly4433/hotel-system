"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MaintenanceForm, { MaintenanceFormData } from "../MaintenanceForm";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress, Stack } from "@mui/material";

type Property = {
  id: string;
  name: string;
};

type Room = {
  id: string;
  roomNumber: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function NewMaintenanceTicketPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [propertiesData, roomsData, employeesData] = await Promise.all([
          apiJson<Property[]>("properties"),
          apiJson<Room[]>("rooms"),
          apiJson<Employee[]>("employees"),
        ]);
        setProperties(propertiesData);
        setRooms(roomsData);
        setEmployees(employeesData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  async function handleSubmit(form: MaintenanceFormData) {
    setError(null);
    setIsSubmitting(true);

    const payload = {
      propertyId: form.propertyId,
      roomId: form.roomId,
      priority: form.priority,
      status: form.status,
      description: form.description,
      reportedByUserId: form.reportedByUserId || null,
      assignedToEmployeeId: form.assignedToEmployeeId || null,
    };

    try {
      await apiJson("maintenance/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/maintenance");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push("/admin/maintenance");
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
        title="New Ticket"
        subtitle="Create a new maintenance ticket"
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <MaintenanceForm
          properties={properties}
          rooms={rooms}
          employees={employees}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </Box>
  );
}
