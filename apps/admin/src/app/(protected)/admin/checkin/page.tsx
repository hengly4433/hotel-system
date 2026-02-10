"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { useToast } from "@/contexts/ToastContext";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Stack,
  Chip,
  TablePagination,
  alpha,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import { 
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  MeetingRoom as RoomIcon,
  Event as EventIcon,
  CheckCircle as ConfirmedIcon,
  HourglassEmpty as HoldIcon,
  Cancel as CancelIcon,
  HighlightOff as NoShowIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { format, parseISO, isToday, isTomorrow, isPast, isAfter } from "date-fns";

type Reservation = {
  id: string;
  code: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  primaryGuestId: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  HOLD: { 
    label: "Hold", 
    color: "#854d0e", 
    bg: alpha("#facc15", 0.15),
    icon: <HoldIcon sx={{ fontSize: 16 }} />,
  },
  CONFIRMED: { 
    label: "Confirmed", 
    color: "#166534", 
    bg: alpha("#22c55e", 0.15),
    icon: <ConfirmedIcon sx={{ fontSize: 16 }} />,
  },
  CHECKED_IN: { 
    label: "Checked In", 
    color: "#1d4ed8", 
    bg: alpha("#3b82f6", 0.15),
    icon: <CheckInIcon sx={{ fontSize: 16 }} />,
  },
  CHECKED_OUT: { 
    label: "Checked Out", 
    color: "#6b21a8", 
    bg: alpha("#a855f7", 0.15),
    icon: <CheckOutIcon sx={{ fontSize: 16 }} />,
  },
  CANCELLED: { 
    label: "Cancelled", 
    color: "#b91c1c", 
    bg: alpha("#ef4444", 0.15),
    icon: <CancelIcon sx={{ fontSize: 16 }} />,
  },
  NO_SHOW: { 
    label: "No Show", 
    color: "#4b5563", 
    bg: alpha("#6b7280", 0.15),
    icon: <NoShowIcon sx={{ fontSize: 16 }} />,
  },
};

function formatDateLabel(dateStr: string): { label: string; isSpecial: boolean } {
  const date = parseISO(dateStr);
  if (isToday(date)) return { label: "Today", isSpecial: true };
  if (isTomorrow(date)) return { label: "Tomorrow", isSpecial: true };
  return { label: format(date, "MMM d, yyyy"), isSpecial: false };
}

export default function CheckInOutPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { showSuccess, showError } = useToast();

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
    setLoading(true);
    try {
      await apiJson(`reservations/${id}/checkin`, { method: "POST" });
      showSuccess("Guest checked in successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut(id: string) {
    setLoading(true);
    try {
      await apiJson(`reservations/${id}/checkout`, { method: "POST" });
      showSuccess("Guest checked out successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Filter reservations based on tab and search
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const filteredReservations = reservations.filter((res) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!res.code.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Tab filter
    switch (activeTab) {
      case 0: // Arrivals - CONFIRMED with checkInDate <= today (includes late arrivals)
        return res.status === "CONFIRMED" && res.checkInDate <= todayStr;
      case 1: // Departures - CHECKED_IN with checkOutDate <= today (includes overstays)
        return res.status === "CHECKED_IN" && res.checkOutDate <= todayStr;
      case 2: // In-House - CHECKED_IN
        return res.status === "CHECKED_IN";
      case 3: // All Reservations
        return true;
      default:
        return true;
    }
  });

  const paginatedReservations = filteredReservations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Count for tabs
  const arrivalsCount = reservations.filter(r => r.status === "CONFIRMED" && r.checkInDate <= todayStr).length;
  const departuresCount = reservations.filter(r => r.status === "CHECKED_IN" && r.checkOutDate <= todayStr).length;
  const inHouseCount = reservations.filter(r => r.status === "CHECKED_IN").length;

  return (
    <Box component="main">
      <PageHeader 
        title="Check-in / Check-out" 
        subtitle="Process arrivals and departures"
      />
      
      <Stack spacing={1}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Card 
            sx={{ 
              flex: 1,
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha("#22c55e", 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckInIcon sx={{ color: "#22c55e", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {arrivalsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Arrivals
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              flex: 1,
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha("#a855f7", 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckOutIcon sx={{ color: "#a855f7", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {departuresCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Departures
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              flex: 1,
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha("#3b82f6", 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RoomIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {inHouseCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    In-House
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Main Table Card */}
        <Card 
          sx={{ 
            borderRadius: "18px", 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          {/* Tabs & Search */}
          <Box sx={{ borderBottom: `1px solid ${tokens.colors.grey[200]}`, bgcolor: 'white' }}>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{ px: 2, pt: 0.5 }}
            >
              <Tabs 
                value={activeTab} 
                onChange={(_, value) => { setActiveTab(value); setPage(0); }}
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 'auto',
                    px: 2,
                    minHeight: 48,
                  },
                }}
              >
                <Tab 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Arrivals</span>
                      {arrivalsCount > 0 && (
                        <Chip 
                          label={arrivalsCount} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem',
                            bgcolor: alpha("#22c55e", 0.15),
                            color: "#166534",
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Stack>
                  } 
                />
                <Tab 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Departures</span>
                      {departuresCount > 0 && (
                        <Chip 
                          label={departuresCount} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem',
                            bgcolor: alpha("#a855f7", 0.15),
                            color: "#6b21a8",
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Stack>
                  } 
                />
                <Tab 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>In-House</span>
                      {inHouseCount > 0 && (
                        <Chip 
                          label={inHouseCount} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem',
                            bgcolor: alpha("#3b82f6", 0.15),
                            color: "#1d4ed8",
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Stack>
                  } 
                />
                <Tab label="All" />
              </Tabs>

              <TextField
                placeholder="Search by code..."
                size="small"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: tokens.colors.grey[400], fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 240 }}
              />
            </Stack>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>
                  <TableCell sx={{ width: 60, fontWeight: 700, color: tokens.colors.grey[600] }}>NO</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>RESERVATION CODE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>CHECK-IN</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>CHECK-OUT</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>GUESTS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedReservations.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <EventIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {activeTab === 0 && "No arrivals expected"}
                                {activeTab === 1 && "No departures expected"}
                                {activeTab === 2 && "No guests in-house"}
                                {activeTab === 3 && "No reservations found"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery ? "Try a different search term" : "Check back later"}
                            </Typography>
                        </Box>
                     </TableCell>
                  </TableRow>
                ) : (
                  paginatedReservations.map((reservation, index) => {
                    const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.HOLD;
                    const checkIn = formatDateLabel(reservation.checkInDate);
                    const checkOut = formatDateLabel(reservation.checkOutDate);
                    
                    const canCheckIn = reservation.status === "CONFIRMED";
                    const canCheckOut = reservation.status === "CHECKED_IN";

                    return (
                      <TableRow 
                        key={reservation.id} 
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(tokens.colors.primary.main, 0.02),
                          },
                          cursor: 'pointer'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              fontFamily: 'monospace',
                              bgcolor: tokens.colors.grey[100],
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              color: tokens.colors.grey[800],
                              letterSpacing: '0.5px'
                            }}
                          >
                            {reservation.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={status.icon as React.ReactElement}
                            label={status.label}
                            size="small"
                            sx={{
                              bgcolor: status.bg,
                              color: status.color,
                              fontWeight: 600,
                              height: 24,
                              '& .MuiChip-icon': {
                                color: status.color,
                                fontSize: 16
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontWeight: checkIn.isSpecial ? 600 : 400,
                                color: checkIn.isSpecial ? tokens.colors.primary.main : tokens.colors.grey[700],
                              }}
                            >
                              {checkIn.label}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontWeight: checkOut.isSpecial ? 600 : 400,
                                color: checkOut.isSpecial ? tokens.colors.primary.main : tokens.colors.grey[700],
                              }}
                            >
                              {checkOut.label}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <PersonIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                            <Typography variant="body2" color={tokens.colors.grey[700]}>
                              {reservation.adults} adult{reservation.adults !== 1 ? 's' : ''}
                              {reservation.children > 0 && `, ${reservation.children} chd`}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {canCheckIn && (
                              <Tooltip title="Check-in guest">
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<CheckInIcon />}
                                  onClick={(e) => { e.stopPropagation(); handleCheckIn(reservation.id); }}
                                  disabled={loading}
                                  sx={{
                                    bgcolor: "#22c55e",
                                    '&:hover': { bgcolor: "#16a34a" },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    borderRadius: 1.5
                                  }}
                                >
                                  Check-in
                                </Button>
                              </Tooltip>
                            )}
                            {canCheckOut && (
                              <Tooltip title="Check-out guest">
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<CheckOutIcon />}
                                  onClick={(e) => { e.stopPropagation(); handleCheckOut(reservation.id); }}
                                  disabled={loading}
                                  sx={{
                                    bgcolor: "#a855f7",
                                    '&:hover': { bgcolor: "#9333ea" },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    borderRadius: 1.5
                                  }}
                                >
                                  Check-out
                                </Button>
                              </Tooltip>
                            )}
                            {!canCheckIn && !canCheckOut && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', px: 1 }}>
                                No action
                              </Typography>
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

          {filteredReservations.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredReservations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: `1px solid ${tokens.colors.grey[200]}` }}
            />
          )}
        </Card>
      </Stack>
    </Box>
  );
}
