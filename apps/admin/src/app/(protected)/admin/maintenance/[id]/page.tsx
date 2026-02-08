"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

type Ticket = {
  id: string;
  propertyId: string;
  roomId: string;
  priority: string;
  status: string;
  description: string;
  reportedByUserId: string | null;
  assignedToEmployeeId: string | null;
};

type StatusEvent = {
  status: string;
  changedAt: string;
  changedByUserId: string | null;
};

export default function EditMaintenanceTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
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
        const [ticketData, propertiesData, roomsData, employeesData, eventsData] = await Promise.all([
          apiJson<Ticket>(`maintenance/tickets/${ticketId}`),
          apiJson<Property[]>("properties"),
          apiJson<Room[]>("rooms"),
          apiJson<Employee[]>("employees"),
          apiJson<StatusEvent[]>(`maintenance/tickets/${ticketId}/events`),
        ]);
        setTicket(ticketData);
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
  }, [ticketId]);

  function ticketToFormData(t: Ticket): MaintenanceFormData {
    return {
      propertyId: t.propertyId,
      roomId: t.roomId,
      priority: t.priority,
      status: t.status,
      description: t.description,
      reportedByUserId: t.reportedByUserId || "",
      assignedToEmployeeId: t.assignedToEmployeeId || "",
    };
  }

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
      await apiJson(`maintenance/tickets/${ticketId}`, {
        method: "PUT",
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

  if (!ticket) {
    return (
      <Box component="main">
        <PageHeader title="Edit Ticket" subtitle="Ticket not found" />
        <Alert severity="error">Ticket not found</Alert>
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader
        title="Edit Ticket"
        subtitle="Update maintenance ticket details"
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <MaintenanceForm
          initialData={ticketToFormData(ticket)}
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
