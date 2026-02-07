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
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  CleaningServices as HousekeepingIcon,
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

type Task = {
  id: string;
  propertyId: string;
  roomId: string;
  taskDate: string;
  shift: string;
  status: string;
  assignedToEmployeeId: string | null;
  checklist: string | null;
  dueAt: string | null;
  overdue: boolean;
};

type BoardRow = {
  taskId: string;
  roomId: string;
  roomNumber: string;
  taskDate: string;
  shift: string;
  status: string;
  assignedToEmployeeId: string | null;
  dueAt: string | null;
  overdue: boolean;
};

const SHIFTS = ["AM", "PM", "NIGHT"] as const;
const STATUSES = ["PENDING", "IN_PROGRESS", "DONE", "INSPECTED"] as const;

const EMPTY_FORM = {
  propertyId: "",
  roomId: "",
  taskDate: "",
  shift: "AM",
  status: "PENDING",
  assignedToEmployeeId: "",
  checklist: ""
};

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ status: string; changedAt: string; changedByUserId: string | null }>>([]);
  const [boardDate, setBoardDate] = useState<string>("");
  const [boardPropertyId, setBoardPropertyId] = useState<string>("");
  const [boardShift, setBoardShift] = useState<string>("");
  const [boardRows, setBoardRows] = useState<BoardRow[]>([]);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    try {
      const [tasksData, propertiesData, roomsData, employeesData] = await Promise.all([
        apiJson<Task[]>("housekeeping/tasks"),
        apiJson<Property[]>("properties"),
        apiJson<Room[]>("rooms"),
        apiJson<Employee[]>("employees")
      ]);
      const now = Date.now();
      const tasksWithOverdue = tasksData.map((task) => ({
        ...task,
        overdue:
          !!task.dueAt &&
          task.status !== "DONE" &&
          task.status !== "INSPECTED" &&
          new Date(task.dueAt).getTime() < now
      }));
      setTasks(tasksWithOverdue);
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

  const selectedBoardProperty = useMemo(() => 
    properties.find(p => p.id === boardPropertyId) || null,
  [properties, boardPropertyId]);

  function startEdit(task: Task) {
    setEditingId(task.id);
    setForm({
      propertyId: task.propertyId,
      roomId: task.roomId,
      taskDate: task.taskDate,
      shift: task.shift,
      status: task.status,
      assignedToEmployeeId: task.assignedToEmployeeId || "",
      checklist: task.checklist || ""
    });
    loadEvents(task.id);
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
      taskDate: form.taskDate,
      shift: form.shift,
      status: form.status,
      assignedToEmployeeId: form.assignedToEmployeeId || null,
      checklist: form.checklist || null
    };

    try {
      if (editingId) {
        await apiJson(`housekeeping/tasks/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("housekeeping/tasks", {
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
    if (!confirm("Delete this task?")) return;
    try {
      await apiJson(`housekeeping/tasks/${id}`, { method: "DELETE" });
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

  async function loadBoard() {
    if (!boardPropertyId || !boardDate) {
      setBoardError("Select property and date.");
      return;
    }
    setBoardError(null);
    try {
      const params = new URLSearchParams({
        propertyId: boardPropertyId,
        date: boardDate
      });
      if (boardShift) {
        params.set("shift", boardShift);
      }
      const data = await apiJson<BoardRow[]>(`housekeeping/board?${params.toString()}`);
      const now = Date.now();
      const rowsWithOverdue = data.map((row) => ({
        ...row,
        overdue:
          !!row.dueAt &&
          row.status !== "DONE" &&
          row.status !== "INSPECTED" &&
          new Date(row.dueAt).getTime() < now
      }));
      setBoardRows(rowsWithOverdue);
    } catch (err) {
      setBoardError(getErrorMessage(err));
    }
  }

  async function loadEvents(taskId: string) {
    try {
      const data = await apiJson<Array<{ status: string; changedAt: string; changedByUserId: string | null }>>(
        `housekeeping/tasks/${taskId}/events`
      );
      setEvents(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case "DONE": return { bg: alpha("#22c55e", 0.15), color: "#166534" };
      case "IN_PROGRESS": return { bg: alpha("#f59e0b", 0.15), color: "#92400e" };
      case "INSPECTED": return { bg: alpha("#3b82f6", 0.15), color: "#1e40af" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  return (
    <Box component="main">
      <PageHeader 
        title="Housekeeping" 
        subtitle="Daily cleaning tasks"
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
              New Task
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

        {/* Housekeeping Board */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Housekeeping Board
            </Typography>
            {boardError && <Alert severity="error" sx={{ mb: 2 }}>{boardError}</Alert>}
            
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  options={properties}
                  getOptionLabel={(option) => option.name}
                  value={selectedBoardProperty}
                  onChange={(_, newValue) => {
                    setBoardPropertyId(newValue?.id || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Property"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  type="date"
                  label="Date"
                  value={boardDate}
                  onChange={(e) => setBoardDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Shift (Optional)"
                  value={boardShift}
                  onChange={(e) => setBoardShift(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="">All</MenuItem>
                  {SHIFTS.map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={loadBoard} 
                  fullWidth
                  startIcon={<AssignmentIcon />}
                >
                  Load
                </Button>
              </Grid>
            </Grid>

            {boardRows.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Room</TableCell>
                        <TableCell>Shift</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned</TableCell>
                        <TableCell>Due</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {boardRows.map((row) => {
                        const statusStyle = getStatusColor(row.status);
                        return (
                          <TableRow key={row.taskId}>
                            <TableCell sx={{ fontWeight: 500 }}>{row.roomNumber || roomLabel(row.roomId)}</TableCell>
                            <TableCell>{row.shift}</TableCell>
                            <TableCell>
                              <Chip 
                                label={row.status} 
                                size="small" 
                                sx={{ 
                                  bgcolor: statusStyle.bg, 
                                  color: statusStyle.color,
                                  fontWeight: 600,
                                }} 
                              />
                            </TableCell>
                            <TableCell>{employeeName(row.assignedToEmployeeId)}</TableCell>
                            <TableCell sx={{ color: row.overdue ? "error.main" : "text.secondary" }}>
                              {row.dueAt ? new Date(row.dueAt).toLocaleString() : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>

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
                    <HousekeepingIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Task" : "Create New Task"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update housekeeping task" : "Add a new cleaning task"}
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
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      type="date"
                      label="Date"
                      value={form.taskDate}
                      onChange={(e) => setForm({ ...form, taskDate: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Shift"
                      value={form.shift}
                      onChange={(e) => setForm({ ...form, shift: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    >
                      {SHIFTS.map((shift) => (
                        <MenuItem key={shift} value={shift}>
                          {shift}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Checklist (JSON)"
                      value={form.checklist}
                      onChange={(e) => setForm({ ...form, checklist: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                        {editingId ? "Update Task" : "Create Task"}
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
                  <TableCell>Date</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <HousekeepingIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No housekeeping tasks found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first cleaning task
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Task
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task, index) => {
                      const statusStyle = getStatusColor(task.status);
                      return (
                        <TableRow 
                          key={task.id} 
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
                          <TableCell sx={{ fontWeight: 500 }}>{task.taskDate}</TableCell>
                          <TableCell>{propertyName(task.propertyId)}</TableCell>
                          <TableCell>{roomLabel(task.roomId)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={task.status} 
                              size="small" 
                              sx={{ 
                                bgcolor: statusStyle.bg, 
                                color: statusStyle.color,
                                fontWeight: 600,
                              }} 
                            />
                          </TableCell>
                          <TableCell>{employeeName(task.assignedToEmployeeId)}</TableCell>
                          <TableCell sx={{ color: task.overdue ? "error.main" : "text.primary" }}>
                            {task.dueAt ? new Date(task.dueAt).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton 
                                size="small" 
                                onClick={() => startEdit(task)}
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
                                onClick={() => handleDelete(task.id)}
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
          {tasks.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tasks.length}
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
