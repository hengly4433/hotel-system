"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  TablePagination,
  Collapse,
  alpha,
  Autocomplete,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  PlayArrow, 
  CheckCircle, 
  Close as CloseIcon,
  Build as MaintenanceIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

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
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const selectedProperty = useMemo(() => 
    properties.find(p => p.id === form.propertyId) || null,
  [properties, form.propertyId]);

  const selectedRoom = useMemo(() => 
    rooms.find(r => r.id === form.roomId) || null,
  [rooms, form.roomId]);

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === form.assignedToEmployeeId) || null,
  [employees, form.assignedToEmployeeId]);

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
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setEvents([]);
    setShowForm(false);
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

  function getPriorityColor(priority: string) {
    switch(priority) {
      case "URGENT": return { bg: alpha("#ef4444", 0.15), color: "#b91c1c" };
      case "HIGH": return { bg: alpha("#f59e0b", 0.15), color: "#92400e" };
      case "MEDIUM": return { bg: alpha("#3b82f6", 0.15), color: "#1e40af" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case "RESOLVED": 
      case "CLOSED": return { bg: alpha("#22c55e", 0.15), color: "#166534" };
      case "IN_PROGRESS": return { bg: alpha("#f59e0b", 0.15), color: "#92400e" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  return (
    <Box component="main">
      <PageHeader 
        title="Maintenance" 
        subtitle="Work orders and tickets"
        action={
          !showForm ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
              }}
            >
              New Ticket
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

        {/* Collapsible Form */}
        <Collapse in={showForm}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: alpha(tokens.colors.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaintenanceIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Ticket" : "Create New Ticket"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update maintenance ticket" : "Add a new work order"}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={resetForm} 
                  size="small"
                  sx={{
                    bgcolor: tokens.colors.grey[100],
                    '&:hover': { bgcolor: tokens.colors.grey[200] }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={properties}
                      getOptionLabel={(option) => option.name}
                      value={selectedProperty}
                      onChange={(_, newValue) => {
                        setForm({ ...form, propertyId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Property"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={rooms}
                      getOptionLabel={(option) => option.roomNumber}
                      value={selectedRoom}
                      onChange={(_, newValue) => {
                        setForm({ ...form, roomId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Room"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      label="Priority"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Reported By (User ID)"
                      value={form.reportedByUserId}
                      onChange={(e) => setForm({ ...form, reportedByUserId: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                      value={selectedEmployee}
                      onChange={(_, newValue) => {
                        setForm({ ...form, assignedToEmployeeId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned Employee"
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        sx={{
                          boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                      >
                        {editingId ? "Update Ticket" : "Create Ticket"}
                      </Button>
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
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" fontWeight="medium">{event.status}</Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">{new Date(event.changedAt).toLocaleString()}</Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" align="right">{event.changedByUserId || "system"}</Typography>
                          </Grid>
                        </Grid>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Collapse>

        {/* Table */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>No</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <MaintenanceIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No maintenance tickets found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first work order
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Ticket
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((ticket, index) => {
                      const priorityStyle = getPriorityColor(ticket.priority);
                      const statusStyle = getStatusColor(ticket.status);
                      return (
                        <TableRow 
                          key={ticket.id} 
                          hover
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(tokens.colors.primary.main, 0.02),
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>
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
                              sx={{ 
                                bgcolor: priorityStyle.bg, 
                                color: priorityStyle.color,
                                fontWeight: 600,
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ticket.status} 
                              size="small" 
                              sx={{ 
                                bgcolor: statusStyle.bg, 
                                color: statusStyle.color,
                                fontWeight: 600,
                              }} 
                            />
                          </TableCell>
                          <TableCell>{employeeName(ticket.assignedToEmployeeId)}</TableCell>
                          <TableCell sx={{ color: ticket.overdue ? "error.main" : "text.primary" }}>
                            {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton 
                                size="small" 
                                title="Start" 
                                onClick={() => updateWorkflow(ticket.id, "start")}
                                sx={{
                                  bgcolor: alpha("#f59e0b", 0.08),
                                  color: "#92400e",
                                  '&:hover': { bgcolor: alpha("#f59e0b", 0.15) }
                                }}
                              >
                                <PlayArrow fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                title="Resolve" 
                                onClick={() => updateWorkflow(ticket.id, "resolve")}
                                sx={{
                                  bgcolor: alpha("#22c55e", 0.08),
                                  color: "#166534",
                                  '&:hover': { bgcolor: alpha("#22c55e", 0.15) }
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                title="Edit" 
                                onClick={() => startEdit(ticket)}
                                sx={{
                                  bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                  color: tokens.colors.primary.main,
                                  '&:hover': { bgcolor: alpha(tokens.colors.primary.main, 0.15) }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                title="Delete" 
                                onClick={() => handleDelete(ticket.id)}
                                sx={{
                                  bgcolor: alpha(tokens.colors.error.main, 0.08),
                                  color: tokens.colors.error.main,
                                  '&:hover': { bgcolor: alpha(tokens.colors.error.main, 0.15) }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {tickets.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tickets.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </Card>
      </Stack>
    </Box>
  );
}
