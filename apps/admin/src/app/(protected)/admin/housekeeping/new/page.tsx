"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import HousekeepingForm, { HousekeepingFormData } from "../HousekeepingForm";
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

export default function NewHousekeepingTaskPage() {
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

  async function handleSubmit(form: HousekeepingFormData) {
    setError(null);
    setIsSubmitting(true);

    const payload = {
      propertyId: form.propertyId,
      roomId: form.roomId,
      taskDate: form.taskDate,
      shift: form.shift,
      status: form.status,
      assignedToEmployeeId: form.assignedToEmployeeId || null,
      checklist: form.checklist || null,
    };

    try {
      await apiJson("housekeeping/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/housekeeping");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push("/admin/housekeeping");
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
        title="New Task"
        subtitle="Create a new housekeeping task"
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <HousekeepingForm
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
