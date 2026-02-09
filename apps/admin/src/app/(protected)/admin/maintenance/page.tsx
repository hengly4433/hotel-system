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
  PlayArrow, 
  CheckCircle, 
  Build as MaintenanceIcon,
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

type Ticket = {
  id: string;
  propertyId: string;
  roomId: string;
  priority: string;
  status: string;
  description: string;
  reportedByUserId: string | null;
  assignedToEmployeeId: string | null;
  openedAt: string;
  closedAt: string | null;
  dueAt: string | null;
  overdue: boolean;
};

export default function MaintenancePage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [ticketsData, propertiesData, roomsData, employeesData] = await Promise.all([
        apiJson<Ticket[]>("maintenance/tickets"),
        apiJson<Property[]>("properties"),
        apiJson<Room[]>("rooms"),
        apiJson<Employee[]>("employees")
      ]);
      const now = Date.now();
      const ticketsWithOverdue = ticketsData.map((ticket) => ({
        ...ticket,
        overdue:
          !!ticket.dueAt &&
          ticket.status !== "CLOSED" &&
          new Date(ticket.dueAt).getTime() < now
      }));
      setTickets(ticketsWithOverdue);
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

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`maintenance/tickets/${deleteId}`, { method: "DELETE" });
      showSuccess("Ticket deleted successfully");
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

  async function updateWorkflow(id: string, action: "start" | "resolve" | "close") {
    try {
      await apiJson(`maintenance/tickets/${id}/${action}`, { method: "POST" });
      showSuccess(`Ticket ${action === 'start' ? 'started' : action === 'resolve' ? 'resolved' : 'closed'} successfully`);
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  }

  function getPriorityColor(priority: string) {
    switch(priority) {
      case "URGENT": return { bg: alpha("#ef4444", 0.15), color: "#b91c1c" };
      case "HIGH": return { bg: alpha("#f59e0b", 0.15), color: "#92400e" };
      case "MEDIUM": return { bg: alpha("#3b82f6", 0.15), color: "#1e40af" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case "RESOLVED": 
      case "CLOSED": return { bg: alpha("#22c55e", 0.15), color: "#166534" };
      case "IN_PROGRESS": return { bg: alpha("#f59e0b", 0.15), color: "#92400e" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  return (
    <Box component="main">
      <PageHeader 
        title="Maintenance" 
        subtitle="Work orders and tickets"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/maintenance/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Ticket
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
                  <TableCell>Room</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <MaintenanceIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No maintenance tickets found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first work order
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => router.push("/admin/maintenance/new")}
                          size="small"
                        >
                          Add Ticket
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((ticket, index) => {
                      const priorityStyle = getPriorityColor(ticket.priority);
                      const statusStyle = getStatusColor(ticket.status);
                      return (
                        <TableRow 
                          key={ticket.id} 
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
                            <Typography variant="body2" fontWeight="medium">
                              {roomLabel(ticket.roomId)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {propertyName(ticket.propertyId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ticket.priority} 
                              size="small" 
                              sx={{ 
                                bgcolor: priorityStyle.bg, 
                                color: priorityStyle.color,
                                fontWeight: 600,
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ticket.status} 
                              size="small" 
                              sx={{ 
                                bgcolor: statusStyle.bg, 
                                color: statusStyle.color,
                                fontWeight: 600,
                              }} 
                            />
                          </TableCell>
                          <TableCell>{employeeName(ticket.assignedToEmployeeId)}</TableCell>
                          <TableCell sx={{ color: ticket.overdue ? "error.main" : "text.primary" }}>
                            {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton 
                                size="small" 
                                title="Start" 
                                onClick={() => updateWorkflow(ticket.id, "start")}
                                sx={{
                                  bgcolor: alpha("#f59e0b", 0.08),
                                  color: "#92400e",
                                  '&:hover': { bgcolor: alpha("#f59e0b", 0.15) }
                                }}
                              >
                                <PlayArrow fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                title="Resolve" 
                                onClick={() => updateWorkflow(ticket.id, "resolve")}
                                sx={{
                                  bgcolor: alpha("#22c55e", 0.08),
                                  color: "#166534",
                                  '&:hover': { bgcolor: alpha("#22c55e", 0.15) }
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                title="Edit" 
                                onClick={() => router.push(`/admin/maintenance/${ticket.id}`)}
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
                                title="Delete" 
                                onClick={() => setDeleteId(ticket.id)}
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
          {tickets.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tickets.length}
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
        title="Delete Ticket?"
        description="This will permanently remove this maintenance ticket."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
