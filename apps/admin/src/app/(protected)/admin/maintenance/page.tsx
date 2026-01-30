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
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Typography,
  Stack,
  Grid,
  Chip,
  List,
  ListItem,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, PlayArrow, CheckCircle } from "@mui/icons-material";

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
  openedAt: string;
  closedAt: string | null;
  dueAt: string | null;
  overdue: boolean;
};

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const EMPTY_FORM = {
  propertyId: "",
  roomId: "",
  priority: "MEDIUM",
  status: "OPEN",
  description: "",
  reportedByUserId: "",
  assignedToEmployeeId: ""
};

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ status: string; changedAt: string; changedByUserId: string | null }>>([]);

  const loadData = useCallback(async () => {
    try {
      const [ticketsData, propertiesData, roomsData, employeesData] = await Promise.all([
        apiJson<Ticket[]>("maintenance/tickets"),
        apiJson<Property[]>("properties"),
        apiJson<Room[]>("rooms"),
        apiJson<Employee[]>("employees")
      ]);
      const now = Date.now();
      const ticketsWithOverdue = ticketsData.map((ticket) => ({
        ...ticket,
        overdue:
          !!ticket.dueAt &&
          ticket.status !== "CLOSED" &&
          new Date(ticket.dueAt).getTime() < now
      }));
      setTickets(ticketsWithOverdue);
      setProperties(propertiesData);
      setRooms(roomsData);
      setEmployees(employeesData);
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

  function startEdit(ticket: Ticket) {
    setEditingId(ticket.id);
    setForm({
      propertyId: ticket.propertyId,
      roomId: ticket.roomId,
      priority: ticket.priority,
      status: ticket.status,
      description: ticket.description,
      reportedByUserId: ticket.reportedByUserId || "",
      assignedToEmployeeId: ticket.assignedToEmployeeId || ""
    });
    loadEvents(ticket.id);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setEvents([]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      roomId: form.roomId,
      priority: form.priority,
      status: form.status,
      description: form.description,
      reportedByUserId: form.reportedByUserId || null,
      assignedToEmployeeId: form.assignedToEmployeeId || null
    };

    try {
      if (editingId) {
        await apiJson(`maintenance/tickets/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("maintenance/tickets", {
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
    if (!confirm("Delete this ticket?")) return;
    try {
      await apiJson(`maintenance/tickets/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function propertyName(propertyId: string) {
    return properties.find((p) => p.id === propertyId)?.name || propertyId;
  }

  function roomLabel(roomId: string) {
    return rooms.find((room) => room.id === roomId)?.roomNumber || roomId;
  }

  function employeeName(employeeId: string | null) {
    if (!employeeId) return "-";
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  }

  async function updateWorkflow(id: string, action: "start" | "resolve" | "close") {
    try {
      await apiJson(`maintenance/tickets/${id}/${action}`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function loadEvents(ticketId: string) {
    try {
      const data = await apiJson<Array<{ status: string; changedAt: string; changedByUserId: string | null }>>(
        `maintenance/tickets/${ticketId}/events`
      );
      setEvents(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <main>
      <PageHeader title="Maintenance" subtitle="Work orders and tickets" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

       <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Ticket" : "Create Ticket"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
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
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Room"
                                value={form.roomId}
                                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                                required
                                fullWidth
                            >
                                <MenuItem value="">Select</MenuItem>
                                {rooms.map((room) => (
                                <MenuItem key={room.id} value={room.id}>
                                    {room.roomNumber}
                                </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Priority"
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                fullWidth
                            >
                                {PRIORITIES.map((priority) => (
                                    <MenuItem key={priority} value={priority}>
                                        {priority}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                fullWidth
                            >
                                {STATUSES.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                             <TextField
                                multiline
                                rows={3}
                                label="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                                fullWidth
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Reported By (User ID)"
                                value={form.reportedByUserId}
                                onChange={(e) => setForm({ ...form, reportedByUserId: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Assigned Employee"
                                value={form.assignedToEmployeeId}
                                onChange={(e) => setForm({ ...form, assignedToEmployeeId: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {employees.map((employee) => (
                                <MenuItem key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName}
                                </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                             <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    startIcon={!editingId && <AddIcon />}
                                >
                                    {editingId ? "Update" : "Create"}
                                </Button>
                                {editingId && (
                                    <Button variant="outlined" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                 {editingId && events.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                         <Typography variant="subtitle2" gutterBottom>Status Timeline</Typography>
                         <List dense disablePadding>
                             {events.map((event, index) => (
                                <ListItem key={index} divider={index < events.length - 1}>
                                     <Grid container>
                                         <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight="medium">{event.status}</Typography></Grid>
                                         <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">{new Date(event.changedAt).toLocaleString()}</Typography></Grid>
                                         <Grid size={{ xs: 4 }}><Typography variant="body2" align="right">{event.changedByUserId || "system"}</Typography></Grid>
                                     </Grid>
                                </ListItem>
                             ))}
                         </List>
                    </Box>
                )}
            </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Assigned</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Due</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tickets
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((ticket, index) => (
                    <TableRow key={ticket.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                                {roomLabel(ticket.roomId)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {propertyName(ticket.propertyId)}
                            </Typography>
                        </TableCell>
                        <TableCell>
                             <Chip 
                                label={ticket.priority} 
                                size="small" 
                                color={
                                    ticket.priority === "URGENT" ? "error" :
                                    ticket.priority === "HIGH" ? "warning" : "default"
                                } 
                                variant={ticket.priority === "URGENT" ? "filled" : "outlined"}
                            />
                        </TableCell>
                        <TableCell>
                             <Chip 
                                label={ticket.status} 
                                size="small" 
                                color={
                                    ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "success" : "default"
                                } 
                            />
                        </TableCell>
                        <TableCell>{employeeName(ticket.assignedToEmployeeId)}</TableCell>
                        <TableCell sx={{ color: ticket.overdue ? "error.main" : "text.primary" }}>
                            {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell align="right">
                           <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <IconButton size="small" title="Start" onClick={() => updateWorkflow(ticket.id, "start")}>
                                    <PlayArrow fontSize="small" />
                                </IconButton>
                                <IconButton size="small" title="Resolve" onClick={() => updateWorkflow(ticket.id, "resolve")}>
                                    <CheckCircle fontSize="small" />
                                </IconButton>
                                <IconButton size="small" title="Edit" onClick={() => startEdit(ticket)} color="primary">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" title="Delete" onClick={() => handleDelete(ticket.id)} color="error">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                           </Stack>
                        </TableCell>
                    </TableRow>
                    ))}
                    {tickets.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No maintenance tickets found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={tickets.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Card>
      </Stack>
    </main>
  );
}
