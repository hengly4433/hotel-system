"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { tokens } from "@/lib/theme";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";

import {
  Box,
  Button,
  Card,
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
  Autocomplete,
  Chip
} from "@mui/material";
import { Search as SearchIcon, CalendarMonth as CalendarIcon } from "@mui/icons-material";

type Property = { id: string; name: string };

type BoardRow = {
  roomId: string;
  roomNumber: string;
  dates: string[];
};

const today = new Date();

export default function RoomBoardPage() {
  const [propertyId, setPropertyId] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [from, setFrom] = useState<Date | null>(today);
  const [to, setTo] = useState<Date | null>(null);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiJson<Property[]>("properties")
      .then(setProperties)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const loadBoard = useCallback(async () => {
    if (!propertyId || !from || !to) return;
    
    setLoading(true);
    try {
      const fromStr = format(from, 'yyyy-MM-dd');
      const toStr = format(to, 'yyyy-MM-dd');
      const data = await apiJson<BoardRow[]>(
        `inventory/rooms?propertyId=${propertyId}&from=${fromStr}&to=${toStr}`
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
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [propertyId, from, to, loadBoard]);

  return (
    <Box component="main">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <PageHeader title="Room Board" subtitle="Occupancy by date" />
      
      <Stack spacing={1}>
        {error && (
            <Alert severity="error" onClose={() => setError(null)}>
                {error}
            </Alert>
        )}

        <Card 
            sx={{ 
                p: 2, 
                mb: 1,
                borderRadius: "18px", 
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`
            }}
        >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                <Autocomplete
                    id="board-property-autocomplete"
                    options={properties}
                    getOptionLabel={(opt) => opt.name}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    value={properties.find(p => p.id === propertyId) || null}
                    onChange={(_, val) => setPropertyId(val?.id || "")}
                    fullWidth
                    sx={{ flex: 1, minWidth: 200 }}
                    renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Property" 
                        placeholder="Search property..." 
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    )}
                    noOptionsText="No properties found"
                />
                <DatePicker
                    label="From"
                    value={from}
                    onChange={(newValue) => setFrom(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true, sx: { flex: 1, minWidth: 150 } } }}
                />
                <DatePicker
                    label="To"
                    value={to}
                    onChange={(newValue) => setTo(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true, sx: { flex: 1, minWidth: 150 } } }}
                />
                <Button 
                    variant="contained" 
                    onClick={loadBoard} 
                    disabled={loading || !propertyId || !from || !to}
                    startIcon={<SearchIcon />}
                    sx={{ 
                        boxShadow: `0 4px 14px ${tokens.colors.primary.main}30`,
                        minWidth: 100
                    }}
                >
                    {loading ? "Loading..." : "Load"}
                </Button>
            </Stack>
        </Card>

        <Card 
            sx={{ 
                borderRadius: "18px", 
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                overflow: 'hidden'
            }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: 120 }}>Room</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dates Booked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {board.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CalendarIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {propertyId && from && to ? "No occupancy found" : "Enter filters to view board"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {propertyId && from && to ? "Try adjusting your dates" : "Select property and date range"}
                            </Typography>
                        </Box>
                     </TableCell>
                  </TableRow>
                ) : (
                    board.map((row) => (
                    <TableRow key={row.roomId} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.roomNumber}</TableCell>
                        <TableCell>
                            {(row.dates || []).length > 0 ? (
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {row.dates.map((date: string) => (
                                    <Chip
                                        key={date}
                                        label={date}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ 
                                            borderRadius: 1,
                                            fontWeight: 500,
                                            bgcolor: 'primary.50',
                                            borderColor: 'primary.100',
                                            color: 'primary.700'
                                        }}
                                    />
                                ))}
                                </Stack>
                            ) : (
                                <Typography variant="caption" color="text.secondary">Available</Typography>
                            )}
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>
      </LocalizationProvider>
    </Box>
  );
}
