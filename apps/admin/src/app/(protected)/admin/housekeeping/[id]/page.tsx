"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

type Task = {
  id: string;
  propertyId: string;
  roomId: string;
  taskDate: string;
  shift: string;
  status: string;
  assignedToEmployeeId: string | null;
  checklist: string | null;
};

type StatusEvent = {
  status: string;
  changedAt: string;
  changedByUserId: string | null;
};

export default function EditHousekeepingTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [taskData, propertiesData, roomsData, employeesData, eventsData] = await Promise.all([
          apiJson<Task>(`housekeeping/tasks/${taskId}`),
          apiJson<Property[]>("properties"),
          apiJson<Room[]>("rooms"),
          apiJson<Employee[]>("employees"),
          apiJson<StatusEvent[]>(`housekeeping/tasks/${taskId}/events`),
        ]);
        setTask(taskData);
        setProperties(propertiesData);
        setRooms(roomsData);
        setEmployees(employeesData);
        setEvents(eventsData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [taskId]);

  function taskToFormData(t: Task): HousekeepingFormData {
    return {
      propertyId: t.propertyId,
      roomId: t.roomId,
      taskDate: t.taskDate,
      shift: t.shift,
      status: t.status,
      assignedToEmployeeId: t.assignedToEmployeeId || "",
      checklist: t.checklist || "",
    };
  }

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
      await apiJson(`housekeeping/tasks/${taskId}`, {
        method: "PUT",
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

  if (!task) {
    return (
      <Box component="main">
        <PageHeader title="Edit Task" subtitle="Task not found" />
        <Alert severity="error">Task not found</Alert>
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader
        title="Edit Task"
        subtitle="Update housekeeping task details"
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <HousekeepingForm
          initialData={taskToFormData(task)}
          properties={properties}
          rooms={rooms}
          employees={employees}
          events={events}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing
          isSubmitting={isSubmitting}
        />
      </Stack>
    </Box>
  );
}
