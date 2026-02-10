"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Paper, Typography, Box, Alert, Skeleton, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, alpha, Divider } from "@mui/material";
import { GradientCard } from "@/components/ui/GradientCard";
import PageHeader from "@/components/ui/PageHeader";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  EventNote,
  People,
  Hotel,
  FlightLand as ArrivalsIcon,
  FlightTakeoff as DeparturesIcon,
  CleaningServices as HousekeepingIcon,
  ArrowForward,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { getErrorMessage } from "@/lib/api/errors";
import { reportsApi, GuestInHouseItem, HousekeepingStatusItem, RevenueReportItem, OccupancyReportItem } from "@/lib/api/reports";
import { apiJson } from "@/lib/api/client";
import { format } from "date-fns";

// Types for API responses
type ReservationPreview = {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  roomNumber: string;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [revenueData, setRevenueData] = useState<RevenueReportItem[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyReportItem[]>([]);
  const [activeGuestsCount, setActiveGuestsCount] = useState(0);
  const [arrivalsToday, setArrivalsToday] = useState<GuestInHouseItem[]>([]);
  const [departuresToday, setDeparturesToday] = useState<GuestInHouseItem[]>([]);
  const [housekeepingStatus, setHousekeepingStatus] = useState<HousekeepingStatusItem[]>([]);
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [recentReservations, setRecentReservations] = useState<ReservationPreview[]>([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - 7);

      const todayStr = format(today, "yyyy-MM-dd");
      const fromDateStr = format(fromDate, "yyyy-MM-dd");

      const [
        revenueRes,
        occupancyRes,
        guestsRes,
        arrivalsRes,
        departuresRes,
        housekeepingRes,
        newBookingsRes,
        recentRes,
      ] = await Promise.all([
        reportsApi.getRevenue({ fromDate: fromDateStr, toDate: todayStr }).catch(() => []),
        reportsApi.getOccupancy({ fromDate: fromDateStr, toDate: todayStr }).catch(() => []),
        reportsApi.getGuestsInHouse(todayStr).catch(() => []),
        reportsApi.getArrivals(todayStr).catch(() => []),
        reportsApi.getDepartures(todayStr).catch(() => []),
        reportsApi.getHousekeeping().catch(() => []),
        reportsApi.getNewBookingsCount(todayStr).catch(() => 0),
        // Fetch recent reservations separately/optimized if possible, currently reusing existing endpoint but limit logic should ideally be backend
        apiJson<ReservationPreview[]>(`reservations?limit=5`).catch(() => []),
      ]);

      setRevenueData(revenueRes);
      setOccupancyData(occupancyRes);
      setActiveGuestsCount(guestsRes.length);
      setArrivalsToday(arrivalsRes);
      setDeparturesToday(departuresRes);
      setHousekeepingStatus(housekeepingRes);
      setNewBookingsCount(newBookingsRes);

      // If backend doesn't support limit param yet, slice here. 
      // Assuming apiJson<ReservationPreview[]> returns all sorted by desc.
      setRecentReservations(recentRes.slice(0, 5));

      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Calculate metrics
  const totalRevenue = useMemo(() =>
    revenueData.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    [revenueData]);

  const avgOccupancy = useMemo(() => {
    if (occupancyData.length === 0) return 0;
    return occupancyData.reduce((sum, o) => sum + (o.occupancyPercentage || 0), 0) / occupancyData.length;
  }, [occupancyData]);

  // Group revenue by date for chart
  const revenueChartData = useMemo(() => {
    const byDate = new Map<string, number>();
    revenueData.forEach(r => {
      const current = byDate.get(r.date) || 0;
      byDate.set(r.date, current + (r.totalAmount || 0));
    });
    // Ensure last 7 days are represented even if 0
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, "yyyy-MM-dd");
      chartData.push({
        date: formatDate(dateStr),
        amount: byDate.get(dateStr) || 0,
        fullDate: dateStr
      });
    }
    return chartData;
  }, [revenueData]);

  // Housekeeping donut chart data
  const housekeepingChartData = useMemo(() => {
    const colors: Record<string, string> = {
      'DONE': '#22c55e',          // Green
      'IN_PROGRESS': '#f59e0b',   // Amber
      'PENDING': '#ef4444',       // Red
      'INSPECTED': '#3b82f6',     // Blue
      'CLEAN': '#22c55e',
      'DIRTY': '#ef4444',
      'CLEANING': '#f59e0b',
    };

    // Aggregate counts by status
    const counts = housekeepingStatus.reduce((acc, curr) => {
      const status = curr.housekeepingStatus || (curr as any).status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status] || tokens.colors.grey[400],
    }));
  }, [housekeepingStatus]);

  const totalHousekeepingTasks = housekeepingStatus.length;

  function getStatusColor(status: string) {
    switch (status) {
      case "CONFIRMED": return { bg: alpha("#3b82f6", 0.1), color: "#2563eb", label: "Confirmed" };
      case "CHECKED_IN": return { bg: alpha("#22c55e", 0.1), color: "#16a34a", label: "Checked In" };
      case "CHECKED_OUT": return { bg: alpha("#8b5cf6", 0.1), color: "#7c3aed", label: "Checked Out" };
      case "CANCELLED": return { bg: alpha("#ef4444", 0.1), color: "#dc2626", label: "Cancelled" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600], label: status };
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: "60px" }}>
      {/* Top Section: Header & KPI Cards */}
      <Box>
        <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 4 }} />
              ))}
            </>
          ) : (
            <>
              <GradientCard
                title="Weekly Revenue"
                value={formatCurrency(totalRevenue)}
                change={revenueData.length > 0 ? `Last 7 Days` : undefined}
                trend="up"
                icon={<TrendingUp />}
                gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
              />
              <GradientCard
                title="New Bookings"
                value={String(newBookingsCount)}
                change="Today"
                trend="up"
                icon={<EventNote />}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
              <GradientCard
                title="Active Guests"
                value={String(activeGuestsCount)}
                change={arrivalsToday.length > 0 ? `+${arrivalsToday.length} arriving` : undefined}
                trend="up"
                icon={<People />}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
              <GradientCard
                title="Occupancy Rate"
                value={`${Math.round(avgOccupancy)}%`}
                change={occupancyData.length > 0 ? "7-day avg" : undefined}
                trend="up"
                icon={<Hotel />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </>
          )}
        </Box>
      </Box>

      {/* Main Content: Two columns on large screens */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3, alignItems: 'stretch' }}>
        {/* Left Column: Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Revenue Chart */}
          <Paper sx={{ p: 3, borderRadius: "18px", border: `1px solid ${tokens.colors.grey[200]}`, boxShadow: tokens.shadows.card }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">Revenue Trend</Typography>
                <Typography variant="body2" color="text.secondary">Income over the last 7 days</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 280 }}>
              {loading ? (
                <Skeleton variant="rounded" height="100%" />
              ) : revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tokens.colors.primary.main} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={tokens.colors.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.colors.grey[100]} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: tokens.colors.grey[500], fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: tokens.colors.grey[500], fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      dx={-10}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      cursor={{ stroke: tokens.colors.grey[300], strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={tokens.colors.primary.main}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: tokens.colors.primary.main }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No revenue data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Recent Reservations Table */}
          <Paper sx={{ borderRadius: "18px", border: `1px solid ${tokens.colors.grey[200]}`, overflow: 'hidden', boxShadow: tokens.shadows.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${tokens.colors.grey[200]}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">Recent Reservations</Typography>
                <Typography variant="body2" color="text.secondary">Latest bookings in the system</Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead sx={{ bgcolor: tokens.colors.grey[50] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: tokens.colors.grey[600], bgcolor: tokens.colors.grey[50] }}>Guest</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.colors.grey[600], bgcolor: tokens.colors.grey[50] }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.colors.grey[600], bgcolor: tokens.colors.grey[50] }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.colors.grey[600], bgcolor: tokens.colors.grey[50] }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.colors.grey[600], bgcolor: tokens.colors.grey[50] }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                      </TableRow>
                    ))
                  ) : recentReservations.length > 0 ? (
                    recentReservations.map((res) => {
                      const statusStyle = getStatusColor(res.status);
                      return (
                        <TableRow key={res.id} hover>
                          <TableCell sx={{ fontWeight: 600, color: tokens.colors.grey[800] }}>{res.guestName || "Unknown Guest"}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {res.roomNumber || "TBD"}
                            </Typography>
                          </TableCell>
                          <TableCell>{res.checkInDate}</TableCell>
                          <TableCell>{res.checkOutDate}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusStyle.label}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No reservations found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>

        {/* Right Column: Housekeeping & Quick Stats */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Quick Stats Grid */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Paper sx={{ p: 2.5, borderRadius: "18px", border: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: alpha('#3b82f6', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrivalsIcon sx={{ color: '#3b82f6' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">{arrivalsToday.length}</Typography>
                <Typography variant="body2" color="text.secondary">Arrivals Today</Typography>
              </Box>
              <ArrowForward sx={{ color: tokens.colors.grey[300], fontSize: 18 }} />
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: "18px", border: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: alpha('#f59e0b', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DeparturesIcon sx={{ color: '#f59e0b' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">{departuresToday.length}</Typography>
                <Typography variant="body2" color="text.secondary">Departures Today</Typography>
              </Box>
              <ArrowForward sx={{ color: tokens.colors.grey[300], fontSize: 18 }} />
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: "18px", border: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: alpha('#22c55e', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HousekeepingIcon sx={{ color: '#22c55e' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {housekeepingStatus.filter(h => h.housekeepingStatus === 'CLEAN' || h.housekeepingStatus === 'DONE' || h.housekeepingStatus === 'INSPECTED').length}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>/ {totalHousekeepingTasks}</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">Rooms Cleaned</Typography>
              </Box>
              <ArrowForward sx={{ color: tokens.colors.grey[300], fontSize: 18 }} />
            </Paper>
          </Box>

          {/* Housekeeping Status Donut */}
          <Paper sx={{ p: 3, borderRadius: "18px", border: `1px solid ${tokens.colors.grey[200]}`, boxShadow: tokens.shadows.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold">Housekeeping Status</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Room cleaning overview</Typography>

            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 4 }} />
            ) : housekeepingChartData.length > 0 ? (
              <>
                <Box sx={{ height: 220, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={housekeepingChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={8}
                      >
                        {housekeepingChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">{totalHousekeepingTasks}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Rooms</Typography>
                  </Box>
                </Box>
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  {housekeepingChartData.map((item, index) => (
                    <Box key={`${item.name}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 4, bgcolor: item.color }} />
                        <Typography variant="body2" fontWeight={500} color="text.primary">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="text.primary">{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No housekeeping data</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
