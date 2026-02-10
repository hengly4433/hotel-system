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
  InputAdornment,
  Grid,
  MenuItem,
  Collapse,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import EmployeeForm, { EmployeeFormData } from "./EmployeeForm";
import EmployeeListTable from "./EmployeeListTable";

type Property = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  propertyId: string;
  personId: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  hourlyRate: number | null;
  skills: string | null;
  photoUrl: string | null;
  employmentStatus: string;
};

const STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;

export default function EmployeesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [employeesData, propertiesData] = await Promise.all([
        apiJson<Employee[]>("employees"),
        apiJson<Property[]>("properties")
      ]);
      setEmployees(employeesData);
      setProperties(propertiesData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
        (emp.phone && emp.phone.includes(searchQuery));
      
      const matchesProperty = propertyFilter === "all" || emp.propertyId === propertyFilter;
      const matchesStatus = statusFilter === "all" || emp.employmentStatus === statusFilter;

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [employees, searchQuery, propertyFilter, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`employees/${deleteId}`, { method: "DELETE" });
      showSuccess("Employee deleted successfully");
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

  function skillsToLabel(skills: string | null) {
    if (!skills) return "-";
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
    } catch {
      return skills;
    }
    return skills;
  }

  // Form Handlers
  const handleCreate = () => {
    setSelectedEmployee(null);
    setView('form');
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setView('form');
  };

  const handleFormSubmit = async (formData: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
        if (selectedEmployee) {
            await apiJson(`employees/${selectedEmployee.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            showSuccess("Employee updated successfully");
        } else {
            await apiJson("employees", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            showSuccess("Employee created successfully");
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
  };

  return (
    <Box component="main">
      <Stack spacing={3}>
        <PageHeader 
            title="Employees" 
            subtitle="Staff profiles and management"
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
                    New Employee
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
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, phone..."
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
                <EmployeeListTable
                    items={filteredEmployees}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                    getPropertyName={propertyName}
                    skillsToLabel={skillsToLabel}
                    onAddClick={handleCreate}
                />
            </Card>
            </>
        ) : (
            <EmployeeForm
                initialData={selectedEmployee ? {
                    propertyId: selectedEmployee.propertyId,
                    firstName: selectedEmployee.firstName,
                    lastName: selectedEmployee.lastName,
                    dob: selectedEmployee.dob || "",
                    phone: selectedEmployee.phone || "",
                    email: selectedEmployee.email || "",
                    addressLine1: selectedEmployee.addressLine1 || "",
                    addressLine2: selectedEmployee.addressLine2 || "",
                    city: selectedEmployee.city || "",
                    state: selectedEmployee.state || "",
                    postalCode: selectedEmployee.postalCode || "",
                    country: selectedEmployee.country || "",
                    jobTitle: selectedEmployee.jobTitle || "",
                    department: selectedEmployee.department || "",
                    hireDate: selectedEmployee.hireDate || "",
                    hourlyRate: selectedEmployee.hourlyRate?.toString() || "",
                    skills: selectedEmployee.skills || "",
                    photoUrl: selectedEmployee.photoUrl || "",
                    employmentStatus: selectedEmployee.employmentStatus || "ACTIVE"
                } : null}
                properties={properties}
                onSubmit={handleFormSubmit}
                onCancel={() => setView('list')}
                isEditing={!!selectedEmployee}
                isSubmitting={isSubmitting}
            />
        )}
      </Stack>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Employee?"
        description="This will permanently remove this employee."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
