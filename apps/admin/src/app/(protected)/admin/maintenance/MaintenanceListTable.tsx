"use client";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Stack,
  Chip,
  TablePagination,
  alpha,
  Button,
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

interface MaintenanceListTableProps {
  items: Ticket[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  onUpdateWorkflow: (id: string, action: "start" | "resolve" | "close") => void;
  getPropertyName: (id: string) => string;
  getRoomLabel: (id: string) => string;
  getEmployeeName: (id: string | null) => string;
  getPriorityColor: (priority: string) => { bg: string; color: string };
  getStatusColor: (status: string) => { bg: string; color: string };
  onAddClick: () => void;
}

export default function MaintenanceListTable({
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onUpdateWorkflow,
  getPropertyName,
  getRoomLabel,
  getEmployeeName,
  getPriorityColor,
  getStatusColor,
  onAddClick,
}: MaintenanceListTableProps) {
  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
        <Table stickyHeader>
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
            {items.length === 0 ? (
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
                      onClick={onAddClick}
                      size="small"
                    >
                      Add Ticket
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              items
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
                          {getRoomLabel(ticket.roomId)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getPropertyName(ticket.propertyId)}
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
                      <TableCell>{getEmployeeName(ticket.assignedToEmployeeId)}</TableCell>
                      <TableCell sx={{ color: ticket.overdue ? "error.main" : "text.primary" }}>
                        {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            title="Start" 
                            onClick={() => onUpdateWorkflow(ticket.id, "start")}
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
                            onClick={() => onUpdateWorkflow(ticket.id, "resolve")}
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
                            onClick={() => onEdit(ticket)}
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
                            onClick={() => onDelete(ticket.id)}
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
      {items.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={items.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </>
  );
}
