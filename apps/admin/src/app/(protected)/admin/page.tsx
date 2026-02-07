"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Paper, Typography, Box, Alert, Skeleton, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, alpha } from "@mui/material";
import { GradientCard } from "@/components/ui/GradientCard";
import PageHeader from "@/components/ui/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { 
  TrendingUp, 
  EventNote, 
  People,
  Hotel,
  FlightLand as ArrivalsIcon,
  FlightTakeoff as DeparturesIcon,
  CleaningServices as HousekeepingIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

// Types for API responses
type RevenueReportItem = {
  date: string;
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
};

type OccupancyReportItem = {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyPercentage: number;
};

type GuestInHouseItem = {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
};

type HousekeepingStatusItem = {
  status: string;
  count: number;
};

type Reservation = {
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
  const [guestsInHouse, setGuestsInHouse] = useState<GuestInHouseItem[]>([]);
  const [arrivalsToday, setArrivalsToday] = useState<GuestInHouseItem[]>([]);
  const [departuresToday, setDeparturesToday] = useState<GuestInHouseItem[]>([]);
  const [housekeepingStatus, setHousekeepingStatus] = useState<HousekeepingStatusItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - 7);
      
      const formatDateParam = (d: Date) => d.toISOString().split('T')[0];
      
      const [
        revenueRes,
        occupancyRes,
        guestsRes,
        arrivalsRes,
        departuresRes,
        housekeepingRes,
        reservationRes,
      ] = await Promise.all([
        apiJson<RevenueReportItem[]>(`reports/revenue?fromDate=${formatDateParam(fromDate)}&toDate=${formatDateParam(today)}`).catch(() => []),
        apiJson<OccupancyReportItem[]>(`reports/occupancy?fromDate=${formatDateParam(fromDate)}&toDate=${formatDateParam(today)}`).catch(() => []),
        apiJson<GuestInHouseItem[]>(`reports/guests-in-house`).catch(() => []),
        apiJson<GuestInHouseItem[]>(`reports/arrivals`).catch(() => []),
        apiJson<GuestInHouseItem[]>(`reports/departures`).catch(() => []),
        apiJson<HousekeepingStatusItem[]>(`reports/housekeeping`).catch(() => []),
        apiJson<Reservation[]>(`reservations`).catch(() => []),
      ]);
      
      setRevenueData(revenueRes);
      setOccupancyData(occupancyRes);
      setGuestsInHouse(guestsRes);
      setArrivalsToday(arrivalsRes);
      setDeparturesToday(departuresRes);
      setHousekeepingStatus(housekeepingRes);
      setReservations(reservationRes);
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
  
  const totalBookings = useMemo(() => 
    revenueData.reduce((sum, r) => sum + (r.transactionCount || 0), 0),
  [revenueData]);
  
  const activeGuests = guestsInHouse.length;
  
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
    return Array.from(byDate.entries())
      .map(([date, amount]) => ({ date: formatDate(date), amount }))
      .slice(-7);
  }, [revenueData]);

  // Housekeeping donut chart data
  const housekeepingChartData = useMemo(() => {
    const colors: Record<string, string> = {
      'DONE': '#22c55e',
      'IN_PROGRESS': '#f59e0b',
      'PENDING': '#ef4444',
      'INSPECTED': '#3b82f6',
    };
    return housekeepingStatus
      .filter(h => h.status && h.count != null)
      .map(h => ({
        name: h.status,
        value: h.count || 0,
        color: colors[h.status] || tokens.colors.grey[400],
      }));
  }, [housekeepingStatus]);

  const totalHousekeepingTasks = housekeepingChartData.reduce((sum, h) => sum + (h.value || 0), 0);

  // Recent reservations for table
  const recentReservations = useMemo(() => 
    reservations.slice(0, 5),
  [reservations]);

  function getStatusColor(status: string) {
    switch(status) {
      case "CONFIRMED": return { bg: alpha("#3b82f6", 0.15), color: "#1e40af" };
      case "CHECKED_IN": return { bg: alpha("#22c55e", 0.15), color: "#166534" };
      case "CHECKED_OUT": return { bg: alpha("#8b5cf6", 0.15), color: "#6b21a8" };
      case "CANCELLED": return { bg: alpha("#ef4444", 0.15), color: "#b91c1c" };
      default: return { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] };
    }
  }

  return (
    <Box component="main">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Top Cards */}
      <Box sx={{ display: 'grid', gap: 3, mb: 4, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
            ))}
          </>
        ) : (
          <>
            <GradientCard
              title="Weekly Revenue"
              value={formatCurrency(totalRevenue)}
              change={revenueData.length > 0 ? `${revenueData.length} days` : undefined}
              trend="up"
              icon={<TrendingUp />}
              gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
            />
            <GradientCard
              title="New Bookings"
              value={String(totalBookings)}
              change={reservations.length > 0 ? `${reservations.filter(r => r.status === 'CONFIRMED').length} confirmed` : undefined}
              trend="up"
              icon={<EventNote />}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <GradientCard
              title="Active Guests"
              value={String(activeGuests)}
              change={arrivalsToday.length > 0 ? `+${arrivalsToday.length} arriving` : undefined}
              trend="up"
              icon={<People />}
              gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            />
            <GradientCard
              title="Occupancy Rate"
              value={`${Math.round(avgOccupancy)}%`}
              change={occupancyData.length > 0 ? "7-day avg" : undefined}
              trend="up"
              icon={<Hotel />}
              gradient={`linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`}
            />
          </>
        )}
      </Box>

      {/* Quick Stats Row */}
      <Box sx={{ display: 'grid', gap: 3, mb: 4, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 2, 
            bgcolor: alpha('#3b82f6', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ArrivalsIcon sx={{ color: '#3b82f6' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">{arrivalsToday.length}</Typography>
            <Typography variant="body2" color="text.secondary">Arrivals Today</Typography>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 2, 
            bgcolor: alpha('#f59e0b', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DeparturesIcon sx={{ color: '#f59e0b' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">{departuresToday.length}</Typography>
            <Typography variant="body2" color="text.secondary">Departures Today</Typography>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 2, 
            bgcolor: alpha('#22c55e', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HousekeepingIcon sx={{ color: '#22c55e' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {housekeepingStatus.find(h => h.status === 'DONE')?.count || 0}/{totalHousekeepingTasks}
            </Typography>
            <Typography variant="body2" color="text.secondary">Rooms Cleaned</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'grid', gap: 3, mb: 4, gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' } }}>
        {/* Revenue Chart */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${tokens.colors.grey[200]}` }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">Revenue Trend</Typography>
            <Typography variant="body2" color="text.secondary">Last 7 days</Typography>
          </Box>
          <Box sx={{ height: 280 }}>
            {loading ? (
              <Skeleton variant="rounded" height="100%" />
            ) : revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tokens.colors.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={tokens.colors.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.colors.grey[200]} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: tokens.colors.grey[500], fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: tokens.colors.grey[500], fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={tokens.colors.primary.main} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
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

        {/* Housekeeping Status Donut */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${tokens.colors.grey[200]}` }}>
          <Typography variant="h6" fontWeight="bold">Housekeeping Status</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Today's task overview</Typography>
          
          {loading ? (
            <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
          ) : housekeepingChartData.length > 0 ? (
            <>
              <Box sx={{ height: 180, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={housekeepingChartData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={55} 
                      outerRadius={80} 
                      paddingAngle={3} 
                      dataKey="value" 
                      strokeWidth={0}
                    >
                      {housekeepingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold">{totalHousekeepingTasks}</Typography>
                  <Typography variant="caption" color="text.secondary">Tasks</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                {housekeepingChartData.map((item, index) => (
                  <Box key={`${item.name}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, px: 1.5, borderRadius: 1, mb: 0.5, bgcolor: alpha(item.color, 0.08) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No housekeeping data</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Recent Reservations */}
      <Paper sx={{ borderRadius: 3, border: `1px solid ${tokens.colors.grey[200]}`, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${tokens.colors.grey[200]}` }}>
          <Typography variant="h6" fontWeight="bold">Recent Reservations</Typography>
          <Typography variant="body2" color="text.secondary">Latest bookings in the system</Typography>
        </Box>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
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
                    <TableCell sx={{ fontWeight: 500 }}>{res.guestName || '-'}</TableCell>
                    <TableCell>{res.roomNumber || '-'}</TableCell>
                    <TableCell>{res.checkInDate}</TableCell>
                    <TableCell>{res.checkOutDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={res.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: statusStyle.bg, 
                          color: statusStyle.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No reservations found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
