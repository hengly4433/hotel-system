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
  Chip,
  Autocomplete,
  alpha
} from "@mui/material";
import { tokens } from "@/lib/theme";
import { Search as SearchIcon } from "@mui/icons-material";

type Property = { id: string; name: string };

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
  const [properties, setProperties] = useState<Property[]>([]);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState("");
  const [availability, setAvailability] = useState<RoomTypeAvailability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiJson<Property[]>("properties")
      .then(setProperties)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

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
                        <Autocomplete
                          id="avail-property-autocomplete"
                          options={properties}
                          getOptionLabel={(opt) => opt.name}
                          isOptionEqualToValue={(a, b) => a.id === b.id}
                          value={properties.find(p => p.id === propertyId) || null}
                          onChange={(_, val) => setPropertyId(val?.id || "")}
                          renderInput={(params) => (
                            <TextField {...params} label="Property" placeholder="Search property..." />
                          )}
                          noOptionsText="No properties found"
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

         <Card sx={{ borderRadius: 3, boxShadow: tokens.shadows.card, border: `1px solid ${tokens.colors.grey[200]}`, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${tokens.colors.grey[200]}`, bgcolor: 'white' }}>
              <Typography variant="h6" fontWeight="bold">Availability Matrix</Typography>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          color: tokens.colors.grey[700],
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          width: 60,
                          textAlign: 'center'
                        }}
                      >
                        No
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          color: tokens.colors.grey[700],
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          minWidth: 180
                        }}
                      >
                        Room Type
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          color: tokens.colors.grey[700],
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          textAlign: 'center',
                          width: 100
                        }}
                      >
                        Total
                      </TableCell>
                      {dateColumns.map((date) => (
                        <TableCell 
                          key={date} 
                          sx={{ 
                            fontWeight: 700, 
                            color: tokens.colors.grey[700],
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            letterSpacing: '0.3px',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            minWidth: 90
                          }}
                        >
                          {date}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availability.map((roomType, index) => (
                      <TableRow 
                        key={roomType.roomTypeId} 
                        sx={{ 
                          '&:hover': { bgcolor: alpha(tokens.colors.primary.main, 0.02) },
                          '&:nth-of-type(even)': { bgcolor: tokens.colors.grey[50] },
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', color: tokens.colors.grey[500], fontWeight: 500 }}>
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color={tokens.colors.grey[800]}>
                              {roomType.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: tokens.colors.grey[500],
                                bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 500
                              }}
                            >
                              {roomType.code}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: alpha(tokens.colors.primary.main, 0.1),
                              color: tokens.colors.primary.main,
                              fontWeight: 700,
                              fontSize: '0.95rem'
                            }}
                          >
                            {roomType.totalRooms}
                          </Box>
                        </TableCell>
                        {roomType.dates.map((entry) => {
                          const isLow = entry.available === 0;
                          const isPartial = entry.available > 0 && entry.available < roomType.totalRooms;
                          const isFull = entry.available === roomType.totalRooms;
                          return (
                            <TableCell key={entry.date} sx={{ textAlign: 'center', p: 1 }}>
                              <Chip 
                                label={`${entry.available}/${roomType.totalRooms}`}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  minWidth: 56,
                                  ...(isLow && {
                                    bgcolor: alpha(tokens.colors.error.main, 0.12),
                                    color: tokens.colors.error.main,
                                    border: `1px solid ${alpha(tokens.colors.error.main, 0.3)}`
                                  }),
                                  ...(isPartial && {
                                    bgcolor: alpha(tokens.colors.warning.main, 0.12),
                                    color: tokens.colors.warning.dark,
                                    border: `1px solid ${alpha(tokens.colors.warning.main, 0.3)}`
                                  }),
                                  ...(isFull && {
                                    bgcolor: alpha(tokens.colors.success.main, 0.12),
                                    color: tokens.colors.success.main,
                                    border: `1px solid ${alpha(tokens.colors.success.main, 0.3)}`
                                  })
                                }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {availability.length === 0 && !loading && (
                      <TableRow>
                        <TableCell 
                          colSpan={3 + dateColumns.length} 
                          align="center" 
                          sx={{ 
                            py: 8, 
                            color: tokens.colors.grey[500],
                            bgcolor: tokens.colors.grey[50]
                          }}
                        >
                          <Typography variant="body2">
                            {propertyId && from && to ? "No availability data found" : "Select a property and date range to check availability"}
                          </Typography>
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
