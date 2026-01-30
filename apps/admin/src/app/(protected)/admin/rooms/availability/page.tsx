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
  Grid,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Chip
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

type AvailabilityDate = {
  date: string;
  reserved: number;
  available: number;
};

type RoomTypeAvailability = {
  roomTypeId: string;
  code: string;
  name: string;
  totalRooms: number;
  dates: AvailabilityDate[];
};

const today = new Date().toISOString().slice(0, 10);

export default function RoomAvailabilityPage() {
  const [propertyId, setPropertyId] = useState("");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState("");
  const [availability, setAvailability] = useState<RoomTypeAvailability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dateColumns = useMemo(() => {
    if (!availability.length) return [];
    return availability[0].dates.map((entry) => entry.date);
  }, [availability]);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<RoomTypeAvailability[]>(
        `availability/room-types?propertyId=${propertyId}&from=${from}&to=${to}`
      );
      setAvailability(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [from, propertyId, to]);

  useEffect(() => {
    if (propertyId && from && to) {
      const timer = setTimeout(() => {
        void loadAvailability();
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [propertyId, from, to, loadAvailability]);

  return (
    <main>
      <PageHeader title="Room Type Availability" subtitle="Inventory by room type" />

      <Stack spacing={3}>
         {error && <Alert severity="error">{error}</Alert>}
         
         <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight="bold">
                        Filter Availability
                    </Typography>
                    <Grid container spacing={3} alignItems="flex-end">
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          id="avail-property-id"
                          label="Property ID"
                          value={propertyId}
                          onChange={(e) => setPropertyId(e.target.value)}
                          fullWidth
                          variant="outlined"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          id="avail-from-date"
                          label="From"
                          type="date"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          id="avail-to-date"
                          label="To"
                          type="date"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={loadAvailability} 
                            disabled={loading}
                            startIcon={<SearchIcon />}
                            sx={{ height: 56 }}
                        >
                          {loading ? "Loading..." : "Load"}
                        </Button>
                      </Grid>
                    </Grid>
                </Stack>
            </CardContent>
         </Card>

         <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <TableContainer component={Paper} elevation={0}>
                 <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                     <Typography variant="h6" fontWeight="bold">Availability Matrix</Typography>
                 </Box>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Room Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Total Rooms</TableCell>
                      {dateColumns.map((date) => (
                        <TableCell key={date} sx={{ fontWeight: "bold", whiteSpace: 'nowrap' }}>{date}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availability.map((roomType) => (
                      <TableRow key={roomType.roomTypeId} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>{roomType.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{roomType.code}</Typography>
                        </TableCell>
                        <TableCell>{roomType.totalRooms}</TableCell>
                        {roomType.dates.map((entry) => {
                             const isLow = entry.available === 0;
                             const isPartial = entry.available < roomType.totalRooms;
                             return (
                              <TableCell key={entry.date}>
                                <Chip 
                                    label={`${entry.available} / ${roomType.totalRooms}`}
                                    size="small"
                                    color={isLow ? "error" : isPartial ? "warning" : "success"}
                                    variant={isLow ? "filled" : "outlined"}
                                />
                              </TableCell>
                             );
                        })}
                      </TableRow>
                    ))}
                    {availability.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={2 + dateColumns.length} align="center" sx={{ py: 6, color: "text.secondary" }}>
                          {propertyId && from && to ? "No availability data found" : "Enter filters to check availability"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            </TableContainer>
         </Card>
      </Stack>
    </main>
  );
}
