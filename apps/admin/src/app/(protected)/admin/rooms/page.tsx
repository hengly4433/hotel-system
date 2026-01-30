"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Typography,
  Stack,
  TableContainer,
  Paper,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

type Room = {
  id: string;
  propertyId: string;
  roomNumber: string;
  roomTypeId: string;
  floor: string | null;
  housekeepingZone: string | null;
  isActive: boolean;
};

type Property = {
  id: string;
  name: string;
};

type RoomType = {
  id: string;
  name: string;
  propertyId: string;
};

const EMPTY_FORM = {
  propertyId: "",
  roomNumber: "",
  roomTypeId: "",
  floor: "",
  housekeepingZone: "",
  isActive: true
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [roomsData, typesData, propertiesData] = await Promise.all([
        apiJson<Room[]>("rooms"),
        apiJson<RoomType[]>("room-types"),
        apiJson<Property[]>("properties")
      ]);
      setRooms(roomsData);
      setRoomTypes(typesData);
      setProperties(propertiesData);
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
    setEditingId(room.id);
    setForm({
      propertyId: room.propertyId,
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      floor: room.floor || "",
      housekeepingZone: room.housekeepingZone || "",
      isActive: room.isActive
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      roomNumber: form.roomNumber,
      roomTypeId: form.roomTypeId,
      floor: form.floor || null,
      housekeepingZone: form.housekeepingZone || null,
      isActive: form.isActive
    };

    try {
      if (editingId) {
        await apiJson(`rooms/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rooms", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      await loadData();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this room?")) return;
    try {
      await apiJson(`rooms/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const visibleRoomTypes = form.propertyId
    ? roomTypes.filter((type) => type.propertyId === form.propertyId)
    : roomTypes;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <main>
      <PageHeader title="Rooms" subtitle="Manage inventory" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {editingId ? "Edit Room" : "Create Room"}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  select
                  label="Property"
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  required
                  fullWidth
                >
                  <MenuItem value="">Select</MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  label="Room Number"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  required
                  fullWidth
                />
                
                <TextField
                  select
                  label="Room Type"
                  value={form.roomTypeId}
                  onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
                  required
                  fullWidth
                >
                  <MenuItem value="">Select</MenuItem>
                  {visibleRoomTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Floor"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  fullWidth
                />
                
                <TextField
                  label="Housekeeping Zone"
                  value={form.housekeepingZone}
                  onChange={(e) => setForm({ ...form, housekeepingZone: e.target.value })}
                  fullWidth
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
                    <FormControlLabel
                        control={
                        <Checkbox
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        }
                        label="Active"
                    />
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={!editingId && <AddIcon />}
                >
                  {editingId ? "Update Room" : "Create Room"}
                </Button>
                {editingId && (
                  <Button variant="outlined" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                     <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Active</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rooms
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((room, index) => (
                    <TableRow key={room.id} hover>
                       <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>{properties.find((p) => p.id === room.propertyId)?.name || room.propertyId}</TableCell>
                      <TableCell>{roomTypes.find((t) => t.id === room.roomTypeId)?.name || room.roomTypeId}</TableCell>
                      <TableCell>
                        <Box 
                            sx={{ 
                                px: 1, 
                                py: 0.5, 
                                bgcolor: room.isActive ? "#dcfce7" : "#f1f5f9", 
                                color: room.isActive ? "#166534" : "#64748b",
                                borderRadius: 1,
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {room.isActive ? "Yes" : "No"}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(room)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(room.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No rooms found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rooms.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Stack>
    </main>
  );
}
