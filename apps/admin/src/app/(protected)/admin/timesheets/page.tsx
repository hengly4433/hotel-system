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
  TablePagination,
  Collapse,
  alpha,
  Autocomplete,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Close as CloseIcon,
  Schedule as TimesheetIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Property = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  propertyId: string;
};

type Timesheet = {
  id: string;
  propertyId: string;
  employeeId: string;
  workDate: string;
  shift: string;
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  totalMinutes: number;
  status: string;
  notes: string | null;
};

const STATUSES = ["OPEN", "SUBMITTED", "APPROVED", "REJECTED"] as const;
const SHIFTS = ["AM", "PM", "NIGHT"] as const;

const EMPTY_FORM = {
  propertyId: "",
  employeeId: "",
  workDate: "",
  shift: "AM",
  clockIn: "",
  clockOut: "",
  breakMinutes: "0",
  status: "OPEN",
  notes: ""
};

function toDateTimeInput(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const employeesForProperty = useMemo(() => {
    if (!selectedPropertyId) return employees;
    return employees.filter((employee) => employee.propertyId === selectedPropertyId);
  }, [employees, selectedPropertyId]);

  const loadLookups = useCallback(async () => {
    try {
      const [propertiesData, employeesData] = await Promise.all([
        apiJson<Property[]>("properties"),
        apiJson<Employee[]>("employees")
      ]);
      setProperties(propertiesData);
      setEmployees(employeesData);
      if (!selectedPropertyId && propertiesData.length > 0) {
        setSelectedPropertyId(propertiesData[0].id);
        setForm((prev) => ({ ...prev, propertyId: propertiesData[0].id }));
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [selectedPropertyId]);

  const loadTimesheets = useCallback(
    async (propertyId: string) => {
      if (!propertyId) return;
      try {
        const data = await apiJson<Timesheet[]>(`timesheets?propertyId=${propertyId}`);
        setTimesheets(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLookups();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLookups]);

  useEffect(() => {
    if (!selectedPropertyId) return undefined;
    const timer = setTimeout(() => {
      void loadTimesheets(selectedPropertyId);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTimesheets, selectedPropertyId]);

  const selectedProperty = useMemo(() => 
    properties.find(p => p.id === form.propertyId) || null,
  [properties, form.propertyId]);

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === form.employeeId) || null,
  [employees, form.employeeId]);

  function resetForm() {
    setEditingId(null);
    setForm((prev) => ({
      ...EMPTY_FORM,
      propertyId: prev.propertyId || selectedPropertyId
    }));
    setShowForm(false);
  }

  function startEdit(timesheet: Timesheet) {
    setEditingId(timesheet.id);
    setForm({
      propertyId: timesheet.propertyId,
      employeeId: timesheet.employeeId,
      workDate: timesheet.workDate,
      shift: timesheet.shift,
      clockIn: toDateTimeInput(timesheet.clockIn),
      clockOut: toDateTimeInput(timesheet.clockOut),
      breakMinutes: String(timesheet.breakMinutes ?? 0),
      status: timesheet.status || "OPEN",
      notes: timesheet.notes || ""
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      employeeId: form.employeeId,
      workDate: form.workDate,
      shift: form.shift,
      clockIn: toIsoOrNull(form.clockIn),
      clockOut: toIsoOrNull(form.clockOut),
      breakMinutes: form.breakMinutes ? Number(form.breakMinutes) : 0,
      status: form.status,
      notes: form.notes || null
    };

    try {
      if (editingId) {
        await apiJson(`timesheets/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("timesheets", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      await loadTimesheets(form.propertyId);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this timesheet?")) return;
    try {
      await apiJson(`timesheets/${id}`, { method: "DELETE" });
      await loadTimesheets(selectedPropertyId);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function employeeLabel(employeeId: string) {
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) return employeeId;
    return `${employee.firstName} ${employee.lastName}`.trim();
  }

  function getStatusColor(status: string) {
    switch(status) {
      case "APPROVED": return { bg: alpha("#22c55e", 0.15), color: "#166534" };
      case "REJECTED": return { bg: alpha("#ef4444", 0.15), color: "#b91c1c" };
      case "SUBMITTED": return { bg: alpha("#3b82f6", 0.15), color: "#1e40af" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  return (
    <Box component="main">
      <PageHeader 
        title="Timesheets" 
        subtitle="Track employee shifts and hours"
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
              New Timesheet
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
                    <TimesheetIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Timesheet" : "Create New Timesheet"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update timesheet details" : "Add a new time entry"}
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
                        const newPropertyId = newValue?.id || "";
                        setForm({ ...form, propertyId: newPropertyId, employeeId: "" });
                        setSelectedPropertyId(newPropertyId);
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
                      options={employeesForProperty}
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                      value={selectedEmployee}
                      onChange={(_, newValue) => {
                        setForm({ ...form, employeeId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Employee"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      type="date"
                      label="Work Date"
                      value={form.workDate}
                      onChange={(e) => setForm({ ...form, workDate: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
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

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      type="datetime-local"
                      label="Clock In"
                      value={form.clockIn}
                      onChange={(e) => setForm({ ...form, clockIn: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      type="datetime-local"
                      label="Clock Out"
                      value={form.clockOut}
                      onChange={(e) => setForm({ ...form, clockOut: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      type="number"
                      label="Break Minutes"
                      value={form.breakMinutes}
                      onChange={(e) => setForm({ ...form, breakMinutes: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                    />
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
                      rows={2}
                      label="Notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                        {editingId ? "Update Timesheet" : "Create Timesheet"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
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
                  <TableCell>Employee</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Clock In</TableCell>
                  <TableCell>Clock Out</TableCell>
                  <TableCell>Minutes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TimesheetIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No timesheets found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first time entry
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Timesheet
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  timesheets
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((timesheet, index) => {
                      const statusStyle = getStatusColor(timesheet.status);
                      return (
                        <TableRow 
                          key={timesheet.id} 
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
                          <TableCell sx={{ fontWeight: 500 }}>{timesheet.workDate}</TableCell>
                          <TableCell>{employeeLabel(timesheet.employeeId)}</TableCell>
                          <TableCell>{timesheet.shift}</TableCell>
                          <TableCell>
                            {timesheet.clockIn ? new Date(timesheet.clockIn).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell>
                            {timesheet.clockOut ? new Date(timesheet.clockOut).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace',
                                fontWeight: 600,
                              }}
                            >
                              {timesheet.totalMinutes}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={timesheet.status} 
                              size="small" 
                              sx={{ 
                                bgcolor: statusStyle.bg, 
                                color: statusStyle.color,
                                fontWeight: 600,
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton 
                                size="small" 
                                onClick={() => startEdit(timesheet)}
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
                                onClick={() => handleDelete(timesheet.id)}
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
          {timesheets.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={timesheets.length}
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
