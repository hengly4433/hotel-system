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
  Typography,
  Stack,
  Grid,
  Chip,
  alpha,
  Autocomplete,
  InputAdornment,
  Collapse,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import HousekeepingForm, { HousekeepingFormData } from "./HousekeepingForm";
import HousekeepingListTable from "./HousekeepingListTable";

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

type StatusEvent = {
  status: string;
  changedAt: string;
  changedByUserId: string | null;
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

export default function HousekeepingPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskEvents, setTaskEvents] = useState<StatusEvent[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Board State
  const [boardDate, setBoardDate] = useState<string>("");
  const [boardPropertyId, setBoardPropertyId] = useState<string>("");
  const [boardShift, setBoardShift] = useState<string>("");
  const [boardRows, setBoardRows] = useState<BoardRow[]>([]);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [showBoard, setShowBoard] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    void loadData();
  }, [loadData]);

  // Load events when editing a task
  useEffect(() => {
    async function loadEvents() {
        if (selectedTask) {
            try {
                const eventsData = await apiJson<StatusEvent[]>(`housekeeping/tasks/${selectedTask.id}/events`);
                setTaskEvents(eventsData);
            } catch (err) {
                console.error("Failed to load task events", err);
            }
        } else {
            setTaskEvents([]);
        }
    }
    loadEvents();
  }, [selectedTask]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = 
        getRoomLabel(task.roomId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPropertyName(task.propertyId).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProperty = propertyFilter === "all" || task.propertyId === propertyFilter;
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesShift = shiftFilter === "all" || task.shift === shiftFilter;

      return matchesSearch && matchesProperty && matchesStatus && matchesShift;
    });
  }, [tasks, searchQuery, propertyFilter, statusFilter, shiftFilter, rooms, properties]);

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

  // Create wrappers for list table to avoid dependency issues in useEffect
  const getPropertyName = (id: string) => propertyName(id);
  const getRoomLabel = (id: string) => rooms.find((r) => r.id === id)?.roomNumber || id;
  const getEmployeeName = (id: string | null) => {
    if (!id) return "-";
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : id;
  };

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

  // Form Handlers
  const handleCreate = () => {
    setSelectedTask(null);
    setView('form');
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setView('form');
  };

  const handleFormSubmit = async (formData: HousekeepingFormData) => {
    setIsSubmitting(true);
    try {
        const payload = {
            propertyId: formData.propertyId,
            roomId: formData.roomId,
            taskDate: formData.taskDate,
            shift: formData.shift,
            status: formData.status,
            assignedToEmployeeId: formData.assignedToEmployeeId || null,
            checklist: formData.checklist || null,
        };

        if (selectedTask) {
            await apiJson(`housekeeping/tasks/${selectedTask.id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            showSuccess("Task updated successfully");
        } else {
            await apiJson("housekeeping/tasks", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            showSuccess("Task created successfully");
        }
        await loadData();
        setView('list');
    } catch (err) {
        showError(getErrorMessage(err));
    } finally {
        setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPropertyFilter("all");
    setStatusFilter("all");
    setShiftFilter("all");
  };

  return (
    <Box component="main">
        <Stack spacing={3}>
            <PageHeader 
                title="Housekeeping" 
                subtitle="Daily cleaning tasks management"
                action={
                view === 'list' ? (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{
                            boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                    >
                        New Task
                    </Button>
                ) : null
                }
            />
            
            <Collapse in={!!error}>
                <Box mb={3}>
                    {error && (
                    <Typography color="error" variant="body2" sx={{ bgcolor: alpha(tokens.colors.error.main, 0.1), p: 2, borderRadius: 2 }}>
                        {error}
                    </Typography>
                    )}
                </Box>
            </Collapse>

            {view === 'list' ? (
                <>
                {/* Housekeeping Board Section */}
                <Card 
                    sx={{ 
                        borderRadius: "18px", 
                        boxShadow: tokens.shadows.card,
                        border: `1px solid ${tokens.colors.grey[200]}`,
                    }}
                >
                    <Box 
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            bgcolor: alpha(tokens.colors.grey[50], 0.5)
                        }}
                        onClick={() => setShowBoard(!showBoard)}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            Housekeeping Board
                        </Typography>
                        <Button size="small" variant="text">
                            {showBoard ? 'Hide Board' : 'Show Board'}
                        </Button>
                    </Box>
                    
                    <Collapse in={showBoard}>
                        <CardContent sx={{ p: 3, pt: 0 }}>
                            {boardError && <Typography color="error" sx={{ mb: 2 }}>{boardError}</Typography>}
                            
                            <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 3 }}>
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
                            <Box sx={{ mt: 3, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${tokens.colors.grey[200]}` }}>
                                            <th style={{ padding: 12, textAlign: 'left', color: tokens.colors.grey[600], fontSize: '0.875rem' }}>Room</th>
                                            <th style={{ padding: 12, textAlign: 'left', color: tokens.colors.grey[600], fontSize: '0.875rem' }}>Shift</th>
                                            <th style={{ padding: 12, textAlign: 'left', color: tokens.colors.grey[600], fontSize: '0.875rem' }}>Status</th>
                                            <th style={{ padding: 12, textAlign: 'left', color: tokens.colors.grey[600], fontSize: '0.875rem' }}>Assigned</th>
                                            <th style={{ padding: 12, textAlign: 'left', color: tokens.colors.grey[600], fontSize: '0.875rem' }}>Due</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {boardRows.map((row) => {
                                            const statusStyle = getStatusColor(row.status);
                                            return (
                                            <tr key={row.taskId} style={{ borderBottom: `1px solid ${tokens.colors.grey[100]}` }}>
                                                <td style={{ padding: 12 }}><b>{row.roomNumber || getRoomLabel(row.roomId)}</b></td>
                                                <td style={{ padding: 12 }}>{row.shift}</td>
                                                <td style={{ padding: 12 }}>
                                                    <Chip 
                                                        label={row.status} 
                                                        size="small" 
                                                        sx={{ 
                                                            bgcolor: statusStyle.bg, 
                                                            color: statusStyle.color,
                                                            fontWeight: 600,
                                                            height: 24,
                                                            fontSize: '0.75rem'
                                                        }} 
                                                    />
                                                </td>
                                                <td style={{ padding: 12 }}>{getEmployeeName(row.assignedToEmployeeId)}</td>
                                                <td style={{ padding: 12, color: row.overdue ? tokens.colors.error.main : 'inherit' }}>
                                                    {row.dueAt ? new Date(row.dueAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Box>
                            )}
                        </CardContent>
                    </Collapse>

                    {/* Filters Section */}
                    <Box sx={{ p: 2, borderTop: `1px solid ${tokens.colors.grey[200]}` }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                fullWidth
                                placeholder="Search room..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                select
                                fullWidth
                                label="Status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                >
                                <MenuItem value="all">All Statuses</MenuItem>
                                {STATUSES.map((status) => (
                                    <MenuItem key={status} value={status}>
                                    {status}
                                    </MenuItem>
                                ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                select
                                fullWidth
                                label="Property"
                                value={propertyFilter}
                                onChange={(e) => setPropertyFilter(e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                >
                                <MenuItem value="all">All Properties</MenuItem>
                                {properties.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }} container spacing={1}>
                                <Grid size={{ xs: 8 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Shift"
                                        value={shiftFilter}
                                        onChange={(e) => setShiftFilter(e.target.value)}
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    >
                                        <MenuItem value="all">All Shifts</MenuItem>
                                        {SHIFTS.map((shift) => (
                                            <MenuItem key={shift} value={shift}>{shift}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={clearFilters}
                                        sx={{ height: 40 }}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>

                {/* List Table */}
                <HousekeepingListTable
                    items={filteredTasks}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                    getPropertyName={getPropertyName}
                    getRoomLabel={getRoomLabel}
                    getEmployeeName={getEmployeeName}
                    getStatusColor={getStatusColor}
                    onAddClick={handleCreate}
                />
                </>
            ) : (
                <HousekeepingForm
                    initialData={selectedTask ? {
                        propertyId: selectedTask.propertyId,
                        roomId: selectedTask.roomId,
                        taskDate: selectedTask.taskDate,
                        shift: selectedTask.shift,
                        status: selectedTask.status,
                        assignedToEmployeeId: selectedTask.assignedToEmployeeId || "",
                        checklist: selectedTask.checklist || "{}",
                    } : null}
                    properties={properties}
                    rooms={rooms}
                    employees={employees}
                    events={taskEvents}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setView('list')}
                    isEditing={!!selectedTask}
                    isSubmitting={isSubmitting}
                />
            )}
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
