"use client";

import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  TablePagination,
  alpha,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CleaningServices as HousekeepingIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Task = {
  id: string;
  propertyId: string;
  roomId: string;
  taskDate: string;
  shift: string;
  status: string;
  assignedToEmployeeId: string | null;
  checklist: string | null;
  dueAt: string | null;
  overdue: boolean;
};

interface HousekeepingListTableProps {
  items: Task[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (item: Task) => void;
  onDelete: (id: string) => void;
  getPropertyName: (id: string) => string;
  getRoomLabel: (id: string) => string;
  getEmployeeName: (id: string | null) => string;
  getStatusColor: (status: string) => { bg: string; color: string };
  onAddClick: () => void;
}

export default function HousekeepingListTable({
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  getPropertyName,
  getRoomLabel,
  getEmployeeName,
  getStatusColor,
  onAddClick
}: HousekeepingListTableProps) {
  return (
    <Card
      sx={{
        borderRadius: "18px",
        boxShadow: tokens.shadows.card,
        border: `1px solid ${tokens.colors.grey[200]}`,
        overflow: 'hidden',
      }}
    >
      <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>No</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned</TableCell>
              <TableCell>Due</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <HousekeepingIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No housekeeping tasks found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first cleaning task
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={onAddClick}
                      size="small"
                    >
                      Add Task
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              items
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task, index) => {
                  const statusStyle = getStatusColor(task.status);
                  return (
                    <TableRow
                      key={task.id}
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
                      <TableCell sx={{ fontWeight: 500 }}>{task.taskDate}</TableCell>
                      <TableCell>{getPropertyName(task.propertyId)}</TableCell>
                      <TableCell>{getRoomLabel(task.roomId)}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            bgcolor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{getEmployeeName(task.assignedToEmployeeId)}</TableCell>
                      <TableCell sx={{ color: task.overdue ? "error.main" : "text.primary" }}>
                        {task.dueAt ? new Date(task.dueAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(task)}
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
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(task.id)}
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
                          </Tooltip>
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
    </Card>
  );
}
