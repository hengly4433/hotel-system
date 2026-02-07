"use client";

import { useCallback, useEffect, useState } from "react";
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
  Autocomplete
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

type Property = { id: string; name: string };

const today = new Date().toISOString().slice(0, 10);

export default function RoomBoardPage() {
  const [propertyId, setPropertyId] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState("");
  const [board, setBoard] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiJson<Property[]>("properties")
      .then(setProperties)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<any[]>(
        `inventory/rooms?propertyId=${propertyId}&from=${from}&to=${to}`
      );
      setBoard(data);
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
        void loadBoard();
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [propertyId, from, to, loadBoard]);

  return (
    <main>
      <PageHeader title="Room Board" subtitle="Occupancy by date" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
                <Typography variant="h6" fontWeight="bold">
                    Filter Board
                </Typography>
                <Grid container spacing={3} alignItems="flex-end">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      id="board-property-autocomplete"
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
                      id="board-from-date"
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
                      id="board-to-date"
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
                        onClick={loadBoard} 
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
                 <Typography variant="h6" fontWeight="bold">Occupancy</Typography>
             </Box>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dates Booked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {board.map((row) => (
                  <TableRow key={row.roomId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.roomNumber}</TableCell>
                    <TableCell>
                         {(row.dates || []).length > 0 ? (
                             <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                             {row.dates.map((date: string) => (
                                 <Paper 
                                    key={date} 
                                    elevation={0}
                                    sx={{ 
                                        bgcolor: 'primary.50', 
                                        color: 'primary.700',
                                        px: 1, 
                                        py: 0.5, 
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        border: '1px solid',
                                        borderColor: 'primary.100'
                                    }}
                                 >
                                     {date}
                                 </Paper>
                             ))}
                             </Stack>
                         ) : (
                             <Typography variant="body2" color="text.secondary">No bookings</Typography>
                         )}
                    </TableCell>
                  </TableRow>
                ))}
                 {board.length === 0 && !loading && (
                  <TableRow>
                     <TableCell colSpan={2} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        {propertyId && from && to ? "No occupancy found for criteria" : "Enter filters to view board"}
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
