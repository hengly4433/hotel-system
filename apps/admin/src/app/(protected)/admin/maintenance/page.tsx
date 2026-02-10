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
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import MaintenanceForm, { MaintenanceFormData } from "./MaintenanceForm";
import MaintenanceListTable from "./MaintenanceListTable";

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

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export default function MaintenancePage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roomSearch, setRoomSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    void loadData();
  }, [loadData]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Room Search
      const room = rooms.find(r => r.id === ticket.roomId);
      const matchesRoom = !roomSearch || (room && room.roomNumber.toLowerCase().includes(roomSearch.toLowerCase()));

      // Filters
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesEmployee = employeeFilter === "all" || ticket.assignedToEmployeeId === employeeFilter;

      return matchesRoom && matchesPriority && matchesStatus && matchesEmployee;
    });
  }, [tickets, rooms, roomSearch, priorityFilter, statusFilter, employeeFilter]);

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

  // Form Handlers
  const handleCreate = () => {
    setSelectedTicket(null);
    setView('form');
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView('form');
  };

  const handleFormSubmit = async (formData: MaintenanceFormData) => {
    setIsSubmitting(true);
    try {
        if (selectedTicket) {
            await apiJson(`maintenance/tickets/${selectedTicket.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            showSuccess("Ticket updated successfully");
        } else {
            await apiJson("maintenance/tickets", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            showSuccess("Ticket created successfully");
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
    setRoomSearch("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setEmployeeFilter("all");
  };

  return (
    <Box component="main">
      <Stack spacing={3}>
        <PageHeader 
            title="Maintenance" 
            subtitle="Work orders and tickets"
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
                    New Ticket
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
                        fullWidth
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="Search room..."
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
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                        select
                        fullWidth
                        label="Priority"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        >
                        <MenuItem value="all">All Priorities</MenuItem>
                        {PRIORITIES.map((p) => (
                            <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                        </TextField>
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
                        label="Assigned To"
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
                <MaintenanceListTable
                    items={filteredTickets}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                    onUpdateWorkflow={updateWorkflow}
                    getPropertyName={propertyName}
                    getRoomLabel={roomLabel}
                    getEmployeeName={employeeName}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    onAddClick={handleCreate}
                />
            </Card>
            </>
        ) : (
            <MaintenanceForm
                initialData={selectedTicket ? {
                    propertyId: selectedTicket.propertyId,
                    roomId: selectedTicket.roomId,
                    priority: selectedTicket.priority,
                    status: selectedTicket.status,
                    description: selectedTicket.description,
                    reportedByUserId: selectedTicket.reportedByUserId || "",
                    assignedToEmployeeId: selectedTicket.assignedToEmployeeId || ""
                } : undefined}
                properties={properties}
                rooms={rooms}
                employees={employees}
                onSubmit={handleFormSubmit}
                onCancel={() => setView('list')}
                isEditing={!!selectedTicket}
                isSubmitting={isSubmitting}
            />
        )}
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
