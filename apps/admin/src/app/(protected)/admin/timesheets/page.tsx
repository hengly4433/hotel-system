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
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

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
  const [selectedProperty, setSelectedProperty] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const employeesForProperty = useMemo(() => {
    if (!selectedProperty) return employees;
    return employees.filter((employee) => employee.propertyId === selectedProperty);
  }, [employees, selectedProperty]);

  const loadLookups = useCallback(async () => {
    try {
      const [propertiesData, employeesData] = await Promise.all([
        apiJson<Property[]>("properties"),
        apiJson<Employee[]>("employees")
      ]);
      setProperties(propertiesData);
      setEmployees(employeesData);
      if (!selectedProperty && propertiesData.length > 0) {
        setSelectedProperty(propertiesData[0].id);
        setForm((prev) => ({ ...prev, propertyId: propertiesData[0].id }));
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [selectedProperty]);

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
    if (!selectedProperty) return undefined;
    const timer = setTimeout(() => {
      void loadTimesheets(selectedProperty);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTimesheets, selectedProperty]);

  function resetForm() {
    setEditingId(null);
    setForm((prev) => ({
      ...EMPTY_FORM,
      propertyId: prev.propertyId || selectedProperty
    }));
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
      await loadTimesheets(selectedProperty);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function employeeLabel(employeeId: string) {
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) return employeeId;
    return `${employee.firstName} ${employee.lastName}`.trim();
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <main>
      <PageHeader title="Timesheets" subtitle="Track employee shifts and hours" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

       <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Timesheet" : "New Timesheet"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Property"
                                value={form.propertyId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setForm((prev) => ({ ...prev, propertyId: value }));
                                    setSelectedProperty(value);
                                }}
                                required
                                fullWidth
                            >
                                <MenuItem value="">Select property</MenuItem>
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
                                label="Employee"
                                value={form.employeeId}
                                onChange={(event) => setForm((prev) => ({ ...prev, employeeId: event.target.value }))}
                                required
                                fullWidth
                            >
                                <MenuItem value="">Select employee</MenuItem>
                                {employeesForProperty.map((employee) => (
                                <MenuItem key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName}
                                </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                type="date"
                                label="Work Date"
                                value={form.workDate}
                                onChange={(event) => setForm((prev) => ({ ...prev, workDate: event.target.value }))}
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
                                onChange={(event) => setForm((prev) => ({ ...prev, shift: event.target.value }))}
                                fullWidth
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
                                onChange={(event) => setForm((prev) => ({ ...prev, clockIn: event.target.value }))}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                type="datetime-local"
                                label="Clock Out"
                                value={form.clockOut}
                                onChange={(event) => setForm((prev) => ({ ...prev, clockOut: event.target.value }))}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                type="number"
                                label="Break Minutes"
                                value={form.breakMinutes}
                                onChange={(event) => setForm((prev) => ({ ...prev, breakMinutes: event.target.value }))}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Status"
                                value={form.status}
                                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
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
                                rows={2}
                                label="Notes"
                                value={form.notes}
                                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
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
                                        Clear
                                    </Button>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Shift</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Clock In</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Clock Out</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Minutes</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold", maxWidth: 200 }}>Notes</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {timesheets
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((timesheet, index) => (
                    <TableRow key={timesheet.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{timesheet.workDate}</TableCell>
                        <TableCell>{employeeLabel(timesheet.employeeId)}</TableCell>
                        <TableCell>{timesheet.shift}</TableCell>
                        <TableCell>{timesheet.clockIn ? new Date(timesheet.clockIn).toLocaleString() : "-"}</TableCell>
                        <TableCell>{timesheet.clockOut ? new Date(timesheet.clockOut).toLocaleString() : "-"}</TableCell>
                        <TableCell>{timesheet.totalMinutes}</TableCell>
                        <TableCell>
                            <Chip 
                                label={timesheet.status} 
                                size="small" 
                                color={
                                    timesheet.status === "APPROVED" ? "success" : 
                                    timesheet.status === "REJECTED" ? "error" : "default"
                                } 
                            />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {timesheet.notes || "-"}
                        </TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(timesheet)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(timesheet.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {timesheets.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No timesheets found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={timesheets.length}
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
