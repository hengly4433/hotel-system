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
  Chip,
  TablePagination,
  alpha,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Schedule as TimesheetIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

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

export default function TimesheetsPage() {
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

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

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId) || null,
    [properties, selectedPropertyId]
  );

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`timesheets/${deleteId}`, { method: "DELETE" });
      showSuccess("Timesheet deleted successfully");
      await loadTimesheets(selectedPropertyId);
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

  return (
    <Box component="main">
      <PageHeader 
        title="Timesheets" 
        subtitle="Track employee shifts and hours"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/timesheets/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Timesheet
          </Button>
        }
      />
      
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
                          onClick={() => router.push("/admin/timesheets/new")}
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
                                onClick={() => router.push(`/admin/timesheets/${timesheet.id}`)}
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
                                onClick={() => setDeleteId(timesheet.id)}
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
