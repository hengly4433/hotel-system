"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Alert,
  Stack,
  Fade,
  alpha
} from "@mui/material"; 
import { Add as AddIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import RoomListTable from "./RoomListTable";
import RoomForm from "./RoomForm";
import { Room } from "./types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<Array<{ id: string; name: string; propertyId: string }>>([]);
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const loadData = useCallback(async () => {
    try {
      const [roomsData, types, props] = await Promise.all([
        apiJson<Room[]>("rooms"),
        apiJson<Array<{ id: string; name: string; propertyId: string }>>("room-types"),
        apiJson<Array<{ id: string; name: string }>>("properties")
      ]);
      setRooms(roomsData);
      setRoomTypes(types);
      setProperties(props);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function startEdit(room: Room) {
    setEditingRoom(room);
    setShowForm(true);
  }

  function startAdd() {
    setEditingRoom(null);
    setShowForm(true);
  }

  function resetForm() {
    setEditingRoom(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(data: any) {
    setError(null);
    setIsSubmitting(true);

    const payload = {
      roomNumber: data.roomNumber,
      roomTypeId: data.roomTypeId,
      propertyId: data.propertyId,
      floorNumber: data.floorNumber,
      description: data.description,
      isActive: data.isActive,
      profileImage: data.profileImage,
      galleryImages: data.galleryImages
    };

    try {
      if (editingRoom) {
        await apiJson(`rooms/${editingRoom.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        showSuccess("Room updated successfully");
      } else {
        await apiJson("rooms", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showSuccess("Room created successfully");
      }
      await loadData();
      resetForm();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
        setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`rooms/${deleteId}`, { method: "DELETE" });
      showSuccess("Room deleted successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  }

  function getRoomTypeName(id: string) {
    const type = roomTypes.find((t) => t.id === id);
    return type?.name || "Unknown";
  }

  function getPropertyName(id: string) {
    const property = properties.find((p) => p.id === id);
    return property?.name || "Unknown";
  }

  return (
    <Box component="main">
      <PageHeader
        title="Rooms"
        subtitle="Manage room inventory and availability"
        // Action button is now handled within the Table empty state or via condition, 
        // but typically standard actions are top-right.
        // We can keep it here OR inside the table. The user request was "separate for Room creation".
        // Let's keep it clean: if showing form, no header action. If showing list, maybe header action?
        // Actually the previous design had it. Let's keep it consistent.
        action={
          !showForm ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={startAdd}
              sx={{
                boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
              }}
            >
              New Room
            </Button>
          ) : null
        } 
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {showForm ? (
          <Fade in={showForm}>
            <Box>
                <RoomForm
                    initialData={editingRoom}
                    properties={properties}
                    roomTypes={roomTypes}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                    isSubmitting={isSubmitting}
                />
            </Box>
          </Fade>
        ) : (
          <Fade in={!showForm}>
            <Box>
                <RoomListTable
                    rooms={rooms}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onEdit={startEdit}
                    onDelete={setDeleteId}
                    getRoomTypeName={getRoomTypeName}
                    getPropertyName={getPropertyName}
                    onAddClick={startAdd}
                />
            </Box>
          </Fade>
        )}
      </Stack>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Room?"
        description="This will permanently remove this room."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
