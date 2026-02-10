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
  Typography,
  Alert,
  Stack,
  alpha,
  MenuItem,
  Grid,
  InputAdornment,
  Collapse,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Search as SearchIcon, // Although we use date filter, search icon might be used for text search if added
  Clear as ClearIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import TimesheetForm, { TimesheetFormData } from "./TimesheetForm";
import TimesheetListTable from "./TimesheetListTable";

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

export default function TimesheetsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);

  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadLookups = useCallback(async () => {
    try {
      const [propertiesData, employeesData] = await Promise.all([
        apiJson<Property[]>("properties"),
        apiJson<Employee[]>("employees")
      ]);
      setProperties(propertiesData);
      setEmployees(employeesData);
      if (!propertyFilter && propertiesData.length > 0) {
        setPropertyFilter(propertiesData[0].id);
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [propertyFilter]);

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
    void loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    if (propertyFilter) {
      void loadTimesheets(propertyFilter);
    }
  }, [loadTimesheets, propertyFilter]);

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((t) => {
      const matchesDate = !dateFilter || t.workDate === dateFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesEmployee = employeeFilter === "all" || t.employeeId === employeeFilter;

      return matchesDate && matchesStatus && matchesEmployee;
    });
  }, [timesheets, dateFilter, statusFilter, employeeFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`timesheets/${deleteId}`, { method: "DELETE" });
      showSuccess("Timesheet deleted successfully");
      if (propertyFilter) {
        await loadTimesheets(propertyFilter);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
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

  // Form Handlers
  const handleCreate = () => {
    setSelectedTimesheet(null);
    setView('form');
  };

  const handleEdit = (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet);
    setView('form');
  };

  const handleFormSubmit = async (formData: TimesheetFormData) => {
    setIsSubmitting(true);
    try {
        if (selectedTimesheet) {
            await apiJson(`timesheets/${selectedTimesheet.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            showSuccess("Timesheet updated successfully");
        } else {
            await apiJson("timesheets", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            showSuccess("Timesheet created successfully");
        }
        if (propertyFilter) {
            await loadTimesheets(propertyFilter);
        }
        setView('list');
    } catch (err) {
        showError(getErrorMessage(err));
    } finally {
        setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setDateFilter("");
    setStatusFilter("all");
    setEmployeeFilter("all");
    // We don't clear propertyFilter as it is mandatory/primary
  };

  return (
    <Box component="main">
      <Stack spacing={3}>
        <PageHeader 
            title="Timesheets" 
            subtitle="Track employee shifts and hours"
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
                    New Timesheet
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
            {/* Filters */}
            <Card 
              sx={{ 
                borderRadius: "18px", 
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
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
                        {properties.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                         <TextField
                            type="date"
                            fullWidth
                            label="Date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
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
                        {STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                        select
                        fullWidth
                        label="Employee"
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        >
                        <MenuItem value="all">All Employees</MenuItem>
                        {employees.map((e) => (
                            <MenuItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</MenuItem>
                        ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
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
              </CardContent>
            </Card>

            {/* List Table */}
            <Card 
              sx={{ 
                borderRadius: "18px", 
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                overflow: 'hidden',
              }}
            >
                <TimesheetListTable
                    items={filteredTimesheets}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                    getEmployeeLabel={employeeLabel}
                    getStatusColor={getStatusColor}
                    onAddClick={handleCreate}
                />
            </Card>
            </>
        ) : (
            <TimesheetForm
                initialData={selectedTimesheet ? {
                    propertyId: selectedTimesheet.propertyId,
                    employeeId: selectedTimesheet.employeeId,
                    workDate: selectedTimesheet.workDate,
                    shift: selectedTimesheet.shift,
                    clockIn: selectedTimesheet.clockIn || "",
                    clockOut: selectedTimesheet.clockOut || "",
                    breakMinutes: selectedTimesheet.breakMinutes?.toString() || "0",
                    status: selectedTimesheet.status,
                    notes: selectedTimesheet.notes || ""
                } : undefined}
                properties={properties}
                employees={employees}
                onSubmit={handleFormSubmit}
                onCancel={() => setView('list')}
                isEditing={!!selectedTimesheet}
                isSubmitting={isSubmitting}
            />
        )}
      </Stack>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Timesheet?"
        description="This will permanently remove this timesheet."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
