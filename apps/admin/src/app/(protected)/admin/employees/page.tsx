"use client";

import { useCallback, useEffect, useState } from "react";
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
  Avatar,
  Chip,
  TablePagination,
  alpha,
  InputAdornment,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Search as SearchIcon,
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

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/employees/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Employee
          </Button>
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
                          onClick={() => router.push("/admin/employees/new")}
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
                            onClick={() => router.push(`/admin/employees/${employee.id}`)}
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
