"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  TablePagination,
  alpha,
  Autocomplete,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Assignment as AssignmentIcon,
  CleaningServices as HousekeepingIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

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

export default function HousekeepingPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [boardDate, setBoardDate] = useState<string>("");
  const [boardPropertyId, setBoardPropertyId] = useState<string>("");
  const [boardShift, setBoardShift] = useState<string>("");
  const [boardRows, setBoardRows] = useState<BoardRow[]>([]);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

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

  const selectedBoardProperty = useMemo(() => 
    properties.find(p => p.id === boardPropertyId) || null,
  [properties, boardPropertyId]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`housekeeping/tasks/${deleteId}`, { method: "DELETE" });
      showSuccess("Task deleted successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/housekeeping/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Task
          </Button>
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
                          onClick={() => router.push("/admin/housekeeping/new")}
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
                                onClick={() => router.push(`/admin/housekeeping/${task.id}`)}
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
                                onClick={() => setDeleteId(task.id)}
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
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Task?"
        description="This will permanently remove this housekeeping task."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
