"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Alert,
  Stack,
  Fade,
  alpha,
  Card,
  TextField,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton
} from "@mui/material"; 
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
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

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 1. Property Filter
      if (propertyFilter !== "ALL" && room.propertyId !== propertyFilter) {
        return false;
      }

      // 2. Type Filter
      if (typeFilter !== "ALL" && room.roomTypeId !== typeFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== "ALL") {
        const isActive = statusFilter === "ACTIVE";
        if (room.isActive !== isActive) return false;
      }

      // 4. Search Query (Room Number)
      if (searchQuery) {
        if (!room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [rooms, propertyFilter, typeFilter, statusFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setPropertyFilter("ALL");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  };

  // Filter available room types based on selected property (if any)
  const availableRoomTypes = useMemo(() => {
     if (propertyFilter === "ALL") return roomTypes;
     return roomTypes.filter(t => t.propertyId === propertyFilter);
  }, [roomTypes, propertyFilter]);

  return (
    <Box component="main">
      <PageHeader
        title="Rooms"
        subtitle="Manage room inventory and availability"
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
                {/* Filters Toolbar */}
                <Card
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: "18px",
                    boxShadow: tokens.shadows.card,
                    border: `1px solid ${tokens.colors.grey[200]}`,
                  }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                    <TextField
                      placeholder="Search room number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ flex: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      select
                      label="Property"
                      value={propertyFilter}
                      onChange={(e) => {
                        setPropertyFilter(e.target.value);
                        // Reset type filter if property changes to avoid mismatch
                        setTypeFilter("ALL"); 
                      }}
                      size="small"
                      sx={{ minWidth: 160, flex: 1 }}
                      fullWidth
                    >
                      <MenuItem value="ALL">All Properties</MenuItem>
                      {properties.map((prop) => (
                        <MenuItem key={prop.id} value={prop.id}>
                          {prop.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Room Type"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 160, flex: 1 }}
                      fullWidth
                    >
                      <MenuItem value="ALL">All Types</MenuItem>
                      {availableRoomTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 120, flex: 1 }}
                      fullWidth
                    >
                      <MenuItem value="ALL">All Status</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </TextField>

                    <Tooltip title="Clear Filters">
                      <IconButton onClick={clearFilters} sx={{ bgcolor: tokens.colors.grey[100] }}>
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Card>

                <RoomListTable
                    rooms={filteredRooms}
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
