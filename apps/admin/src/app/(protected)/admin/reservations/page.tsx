"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Alert,
  Paper,
  Stack,
  TablePagination,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  MeetingRoom as RoomIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  DoNotDisturb as CancelledIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Reservation = {
  id: string;
  code: string;
  status: string;
  channel: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  rooms: Array<{
    id: string;
    roomTypeId: string;
    roomId?: string | null;
    ratePlanId: string;
    guestsInRoom: number;
  }>;
};

const STATUS_CONFIG: Record<string, { 
  color: string; 
  bg: string; 
  icon: React.ReactElement;
  gradient?: string;
}> = {
  CONFIRMED: { 
    color: tokens.colors.success.dark, 
    bg: alpha(tokens.colors.success.main, 0.12),
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    gradient: `linear-gradient(135deg, ${tokens.colors.success.main} 0%, ${tokens.colors.success.dark} 100%)`,
  },
  CHECKED_IN: { 
    color: tokens.colors.primary.dark, 
    bg: alpha(tokens.colors.primary.main, 0.12),
    icon: <CheckInIcon sx={{ fontSize: 14 }} />,
    gradient: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
  },
  CHECKED_OUT: { 
    color: tokens.colors.grey[600], 
    bg: tokens.colors.grey[100],
    icon: <CheckOutIcon sx={{ fontSize: 14 }} />,
  },
  CANCELLED: { 
    color: tokens.colors.error.main, 
    bg: alpha(tokens.colors.error.main, 0.08),
    icon: <CancelledIcon sx={{ fontSize: 14 }} />,
  },
  PENDING: { 
    color: tokens.colors.warning.dark, 
    bg: alpha(tokens.colors.warning.main, 0.12),
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Reservation[]>("reservations");
      setReservations(data);
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

  async function handleCheckIn(id: string) {
    try {
      await apiJson(`reservations/${id}/checkin`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCheckOut(id: string) {
    try {
      await apiJson(`reservations/${id}/checkout`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    if (!cancelId) return;
    try {
      await apiJson(`reservations/${cancelId}/cancel`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelId(null);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <Box component="main">
      <PageHeader
        title="Reservations"
        subtitle="View and manage all bookings"
        action={
          <Button
            variant="contained"
            component={Link}
            href="/admin/reservations/new"
            startIcon={<EventIcon />}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Reservation
          </Button>
        }
      />

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card 
        sx={{ 
          borderRadius: "18px",
          boxShadow: tokens.shadows.card,
          border: `1px solid ${tokens.colors.grey[200]}`,
          overflow: 'hidden',
        }}
      >
        <TableContainer component={Paper} elevation={0} sx={{ height: 400 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell>Booking</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Rooms</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <EventIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No reservations found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first reservation to get started
                      </Typography>
                      <Button
                        variant="contained"
                        component={Link}
                        href="/admin/reservations/new"
                        startIcon={<EventIcon />}
                        size="small"
                      >
                        New Reservation
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                reservations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((res, index) => {
                  const statusConfig = STATUS_CONFIG[res.status] || STATUS_CONFIG.PENDING;
                  return (
                    <TableRow 
                      key={res.id} 
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(tokens.colors.primary.main, 0.02),
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography 
                            variant="body2" 
                            fontWeight={700}
                            sx={{ 
                              color: tokens.colors.primary.main,
                              letterSpacing: '0.5px',
                            }}
                          >
                            {res.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {res.channel || 'Direct'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusConfig.icon}
                          label={res.status.replace('_', ' ')}
                          size="small"
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.7rem', 
                            height: 26,
                            bgcolor: statusConfig.bg,
                            color: statusConfig.color,
                            '& .MuiChip-icon': {
                              color: statusConfig.color,
                            },
                            ...(res.status === 'CANCELLED' && {
                              borderStyle: 'dashed',
                              borderWidth: 1,
                              borderColor: statusConfig.color,
                            })
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(res.checkInDate)} → {formatDate(res.checkOutDate)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.ceil((new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                          <Typography variant="body2">
                            {res.adults} Adult{res.adults !== 1 ? 's' : ''}
                            {res.children > 0 && `, ${res.children} Child${res.children !== 1 ? 'ren' : ''}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RoomIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                          <Typography variant="body2" fontWeight={500}>
                            {res.rooms.length} Room{res.rooms.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              component={Link}
                              href={`/admin/reservations/${res.id}`}
                              size="small"
                              sx={{
                                bgcolor: alpha(tokens.colors.grey[500], 0.08),
                                '&:hover': {
                                  bgcolor: alpha(tokens.colors.primary.main, 0.12),
                                  color: tokens.colors.primary.main,
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {res.status !== "CANCELLED" && res.status !== "CHECKED_OUT" && (
                            <>
                              {res.status !== "CHECKED_IN" && (
                                <Tooltip title="Check In" arrow>
                                  <IconButton
                                    onClick={() => handleCheckIn(res.id)}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                      color: tokens.colors.primary.main,
                                      '&:hover': {
                                        bgcolor: alpha(tokens.colors.primary.main, 0.15),
                                      }
                                    }}
                                  >
                                    <CheckInIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {res.status === "CHECKED_IN" && (
                                <Tooltip title="Check Out" arrow>
                                  <IconButton
                                    onClick={() => handleCheckOut(res.id)}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(tokens.colors.success.main, 0.08),
                                      color: tokens.colors.success.main,
                                      '&:hover': {
                                        bgcolor: alpha(tokens.colors.success.main, 0.15),
                                      }
                                    }}
                                  >
                                    <CheckOutIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Cancel" arrow>
                                <IconButton
                                  onClick={() => setCancelId(res.id)}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(tokens.colors.error.main, 0.08),
                                    color: tokens.colors.error.main,
                                    '&:hover': {
                                      bgcolor: alpha(tokens.colors.error.main, 0.15),
                                    }
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reservations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${tokens.colors.grey[200]}`,
            backgroundColor: tokens.colors.grey[50],
          }}
        />
      </Card>
      <ConfirmDialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Reservation?"
        description="This will cancel the reservation. This action cannot be undone."
        confirmText="Cancel Reservation"
        variant="warning"
      />
    </Box>
  );
}
