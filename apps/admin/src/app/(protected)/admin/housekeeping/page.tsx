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
  Divider,
  List,
  ListItem,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Assignment as AssignmentIcon } from "@mui/icons-material";

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
      <PageHeader title="Housekeeping" subtitle="Daily cleaning tasks" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Housekeeping Board
                </Typography>
                {boardError && <Alert severity="error" sx={{ mb: 2 }}>{boardError}</Alert>}
                
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 12, md: 4 }}>
                         <TextField
                            select
                            label="Property"
                            value={boardPropertyId}
                            onChange={(e) => setBoardPropertyId(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">Select</MenuItem>
                            {properties.map((property) => (
                            <MenuItem key={property.id} value={property.id}>
                                {property.name}
                            </MenuItem>
                            ))}
                        </TextField>
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
                            Load Board
                        </Button>
                    </Grid>
                </Grid>

                {boardRows.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                         <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Shift</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Assigned</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Due</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {boardRows.map((row) => (
                                        <TableRow key={row.taskId}>
                                            <TableCell>{row.roomNumber || roomLabel(row.roomId)}</TableCell>
                                            <TableCell>{row.shift}</TableCell>
                                            <TableCell>
                                                <Chip label={row.status} size="small" color={row.status === "DONE" ? "success" : "default"} />
                                            </TableCell>
                                            <TableCell>{employeeName(row.assignedToEmployeeId)}</TableCell>
                                            <TableCell sx={{ color: row.overdue ? "error.main" : "text.secondary" }}>
                                                {row.dueAt ? new Date(row.dueAt).toLocaleString() : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </TableContainer>
                    </Box>
                )}
            </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Task" : "Create Task"}
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
                            >
                                {STATUSES.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </TextField>
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
                         <Grid size={{ xs: 12, md: 6 }}>
                             <TextField
                                 label="Checklist (JSON)"
                                 value={form.checklist}
                                 onChange={(e) => setForm({ ...form, checklist: e.target.value })}
                                 fullWidth
                             />
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
                     <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Assigned</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Due</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tasks
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((task, index) => (
                    <TableRow key={task.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{task.taskDate}</TableCell>
                        <TableCell>{propertyName(task.propertyId)}</TableCell>
                        <TableCell>{roomLabel(task.roomId)}</TableCell>
                        <TableCell>
                            <Chip 
                                label={task.status} 
                                size="small" 
                                color={
                                    task.status === "DONE" ? "success" : 
                                    task.status === "IN_PROGRESS" ? "warning" : "default"
                                } 
                            />
                        </TableCell>
                        <TableCell>{employeeName(task.assignedToEmployeeId)}</TableCell>
                        <TableCell sx={{ color: task.overdue ? "error.main" : "text.primary" }}>
                             {task.dueAt ? new Date(task.dueAt).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(task)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(task.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {tasks.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No housekeeping tasks found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={tasks.length}
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
