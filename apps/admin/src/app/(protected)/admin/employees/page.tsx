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
  Typography,
  Alert,
  Stack,
  Grid,
  Avatar,
  Chip,
  TablePagination,
  Collapse,
  alpha,
  InputAdornment,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Search as SearchIcon,
  Close as CloseIcon,
  Badge as EmployeeIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

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

const EMPTY_FORM = {
  propertyId: "",
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  jobTitle: "",
  department: "",
  hireDate: "",
  hourlyRate: "",
  skills: "",
  photoUrl: "",
  employmentStatus: "ACTIVE"
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function startEdit(employee: Employee) {
    setEditingId(employee.id);
    setForm({
      propertyId: employee.propertyId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      dob: employee.dob || "",
      phone: employee.phone || "",
      email: employee.email || "",
      addressLine1: employee.addressLine1 || "",
      addressLine2: employee.addressLine2 || "",
      city: employee.city || "",
      state: employee.state || "",
      postalCode: employee.postalCode || "",
      country: employee.country || "",
      jobTitle: employee.jobTitle || "",
      department: employee.department || "",
      hireDate: employee.hireDate || "",
      hourlyRate: employee.hourlyRate !== null ? String(employee.hourlyRate) : "",
      skills: skillsToInput(employee.skills),
      photoUrl: employee.photoUrl || "",
      employmentStatus: employee.employmentStatus || "ACTIVE"
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      firstName: form.firstName,
      lastName: form.lastName,
      dob: form.dob || null,
      phone: form.phone || null,
      email: form.email || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
      jobTitle: form.jobTitle || null,
      department: form.department || null,
      hireDate: form.hireDate || null,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      skills: inputToSkills(form.skills),
      photoUrl: form.photoUrl || null,
      employmentStatus: form.employmentStatus
    };

    try {
      if (editingId) {
        await apiJson(`employees/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("employees", {
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
    if (!confirm("Delete this employee?")) return;
    try {
      await apiJson(`employees/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function propertyName(propertyId: string) {
    return properties.find((p) => p.id === propertyId)?.name || propertyId;
  }

  async function searchEmployees(value: string) {
    if (!value) {
      await loadData();
      return;
    }
    try {
      const data = await apiJson<Employee[]>(`employees/search?q=${encodeURIComponent(value)}`);
      setEmployees(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function skillsToInput(skills: string | null) {
    if (!skills) return "";
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
      return skills;
    } catch {
      return skills;
    }
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

  function inputToSkills(value: string) {
    if (!value) return null;
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    return JSON.stringify(items);
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
    <Box component="main">
      <PageHeader 
        title="Employees" 
        subtitle="Staff profiles and management"
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
              New Employee
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

        {/* Search Card */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <TextField
              fullWidth
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                searchEmployees(value);
              }}
              placeholder="Search by name, email, phone..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </CardContent>
        </Card>

        {/* Form Card */}
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
                    <EmployeeIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Employee" : "Add New Employee"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update employee details" : "Create a new staff profile"}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={resetForm} 
                  size="small"
                  sx={{
                    bgcolor: tokens.colors.grey[100],
                    '&:hover': {
                      bgcolor: tokens.colors.grey[200],
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      select 
                      fullWidth 
                      label="Property" 
                      value={form.propertyId} 
                      onChange={(e) => setForm({ ...form, propertyId: e.target.value })} 
                      required
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      select 
                      fullWidth 
                      label="Status" 
                      value={form.employmentStatus} 
                      onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    >
                      {STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="First Name" 
                      value={form.firstName} 
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                      required 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Last Name" 
                      value={form.lastName} 
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                      required 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      type="date"
                      label="Date of Birth" 
                      value={form.dob} 
                      onChange={(e) => setForm({ ...form, dob: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      type="date"
                      label="Hire Date" 
                      value={form.hireDate} 
                      onChange={(e) => setForm({ ...form, hireDate: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Email" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Phone" 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Job Title" 
                      value={form.jobTitle} 
                      onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Department" 
                      value={form.department} 
                      onChange={(e) => setForm({ ...form, department: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      type="number"
                      label="Hourly Rate" 
                      value={form.hourlyRate} 
                      onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Photo URL" 
                      value={form.photoUrl} 
                      onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField 
                      fullWidth 
                      label="Skills (comma separated)" 
                      value={form.skills} 
                      onChange={(e) => setForm({ ...form, skills: e.target.value })} 
                      InputLabelProps={{ shrink: true }}
                      placeholder="e.g., Housekeeping, Front Desk, Maintenance"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>Address</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField 
                          fullWidth 
                          label="Address Line 1" 
                          value={form.addressLine1} 
                          onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField 
                          fullWidth 
                          label="Address Line 2" 
                          value={form.addressLine2} 
                          onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField 
                          fullWidth 
                          label="City" 
                          value={form.city} 
                          onChange={(e) => setForm({ ...form, city: e.target.value })} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField 
                          fullWidth 
                          label="State" 
                          value={form.state} 
                          onChange={(e) => setForm({ ...form, state: e.target.value })} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField 
                          fullWidth 
                          label="Postal Code" 
                          value={form.postalCode} 
                          onChange={(e) => setForm({ ...form, postalCode: e.target.value })} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField 
                          fullWidth 
                          label="Country" 
                          value={form.country} 
                          onChange={(e) => setForm({ ...form, country: e.target.value })} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button 
                        onClick={resetForm}
                        variant="outlined"
                        sx={{ px: 3 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        sx={{ 
                          px: 4,
                          boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                      >
                        {editingId ? "Update Employee" : "Create Employee"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Table Card */}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <EmployeeIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No employees found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Add your first staff member
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Employee
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee, index) => (
                    <TableRow 
                      key={employee.id} 
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
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={employee.photoUrl || undefined} alt={employee.firstName}>
                            {employee.firstName[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {employee.firstName} {employee.lastName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{propertyName(employee.propertyId)}</TableCell>
                      <TableCell>{employee.jobTitle || "-"}</TableCell>
                      <TableCell>{employee.department || "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {skillsToLabel(employee.skills)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={employee.employmentStatus}
                          size="small" 
                          sx={{
                            bgcolor: employee.employmentStatus === "ACTIVE" 
                              ? alpha(tokens.colors.success.main, 0.12)
                              : tokens.colors.grey[100],
                            color: employee.employmentStatus === "ACTIVE"
                              ? tokens.colors.success.dark
                              : tokens.colors.grey[600],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(employee)}
                            sx={{
                              bgcolor: alpha(tokens.colors.primary.main, 0.08),
                              color: tokens.colors.primary.main,
                              '&:hover': {
                                bgcolor: alpha(tokens.colors.primary.main, 0.15),
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(employee.id)}
                            sx={{
                              bgcolor: alpha(tokens.colors.error.main, 0.08),
                              color: tokens.colors.error.main,
                              '&:hover': {
                                bgcolor: alpha(tokens.colors.error.main, 0.15),
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {employees.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={employees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Card>
      </Stack>
    </Box>
  );
}
