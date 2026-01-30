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
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Typography,
  Stack,
  Grid,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, FilterList as FilterListIcon } from "@mui/icons-material";

type RatePlan = {
  id: string;
  propertyId: string;
  code: string;
  name: string;
};

type RoomType = {
  id: string;
  propertyId: string;
  name: string;
};

type RatePlanPrice = {
  id: string;
  ratePlanId: string;
  roomTypeId: string;
  date: string;
  price: number;
  currency: string;
};

const EMPTY_FORM = {
  ratePlanId: "",
  roomTypeId: "",
  date: "",
  price: "",
  currency: "USD"
};

const EMPTY_FILTER = {
  ratePlanId: "",
  roomTypeId: "",
  from: "",
  to: ""
};

export default function NightlyPricesPage() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [prices, setPrices] = useState<RatePlanPrice[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState(EMPTY_FILTER);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLookups = useCallback(async () => {
    try {
      const [plansData, typesData] = await Promise.all([
        apiJson<RatePlan[]>("rate-plans"),
        apiJson<RoomType[]>("room-types")
      ]);
      setRatePlans(plansData);
      setRoomTypes(typesData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  const loadPrices = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.ratePlanId) params.set("ratePlanId", filters.ratePlanId);
    if (filters.roomTypeId) params.set("roomTypeId", filters.roomTypeId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const query = params.toString();
    const endpoint = query ? `rate-plan-prices?${query}` : "rate-plan-prices";

    try {
      const data = await apiJson<RatePlanPrice[]>(endpoint);
      setPrices(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [filters.from, filters.ratePlanId, filters.roomTypeId, filters.to]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLookups();
      void loadPrices();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLookups, loadPrices]);

  const ratePlanMap = useMemo(() => {
    const map = new Map<string, string>();
    ratePlans.forEach((plan) => map.set(plan.id, `${plan.code} — ${plan.name}`));
    return map;
  }, [ratePlans]);

  const roomTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    roomTypes.forEach((type) => map.set(type.id, type.name));
    return map;
  }, [roomTypes]);

  function startEdit(price: RatePlanPrice) {
    setEditingId(price.id);
    setForm({
      ratePlanId: price.ratePlanId,
      roomTypeId: price.roomTypeId,
      date: price.date,
      price: String(price.price),
      currency: price.currency
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ratePlanId: form.ratePlanId,
      roomTypeId: form.roomTypeId,
      date: form.date,
      price: Number(form.price),
      currency: form.currency || null
    };

    try {
      if (editingId) {
        await apiJson(`rate-plan-prices/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rate-plan-prices", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      await loadPrices();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this nightly price?")) return;
    try {
      await apiJson(`rate-plan-prices/${id}`, { method: "DELETE" });
      await loadPrices();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <main>
      <PageHeader title="Nightly Prices" subtitle="Manage nightly rate plan prices" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Filters
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            select
                            label="Rate Plan"
                            value={filters.ratePlanId}
                            onChange={(e) => setFilters({ ...filters, ratePlanId: e.target.value })}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">All</MenuItem>
                            {ratePlans.map((plan) => (
                                <MenuItem key={plan.id} value={plan.id}>
                                    {plan.code} — {plan.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                         <TextField
                            select
                            label="Room Type"
                            value={filters.roomTypeId}
                            onChange={(e) => setFilters({ ...filters, roomTypeId: e.target.value })}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">All</MenuItem>
                            {roomTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            type="date"
                            label="From"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            type="date"
                            label="To"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button 
                            variant="outlined" 
                            onClick={loadPrices} 
                            fullWidth 
                            startIcon={<FilterListIcon />}
                        >
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Price" : "Create Price"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Rate Plan"
                                value={form.ratePlanId}
                                onChange={(e) => setForm({ ...form, ratePlanId: e.target.value })}
                                required
                                fullWidth
                            >
                                <MenuItem value="">Select</MenuItem>
                                {ratePlans.map((plan) => (
                                <MenuItem key={plan.id} value={plan.id}>
                                    {plan.code} — {plan.name}
                                </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Room Type"
                                value={form.roomTypeId}
                                onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
                                required
                                fullWidth
                            >
                                <MenuItem value="">Select</MenuItem>
                                {roomTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                type="date"
                                label="Date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                type="number"
                                label="Price"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                required
                                fullWidth
                                inputProps={{ step: "0.01" }}
                            />
                        </Grid>
                         <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Currency"
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                fullWidth
                            />
                        </Grid>

                         <Grid size={{ xs: 12 }}>
                             <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    disabled={loading}
                                    startIcon={!editingId && !loading && <AddIcon />}
                                >
                                    {loading ? "Saving..." : editingId ? "Update" : "Create"}
                                </Button>
                                {editingId && (
                                    <Button variant="outlined" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Rate Plan</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Room Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prices
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((price, index) => (
                    <TableRow key={price.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{price.date}</TableCell>
                        <TableCell>{ratePlanMap.get(price.ratePlanId) || price.ratePlanId}</TableCell>
                        <TableCell>{roomTypeMap.get(price.roomTypeId) || price.roomTypeId}</TableCell>
                        <TableCell>
                            {price.price} {price.currency}
                        </TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(price)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(price.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {prices.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No prices found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={prices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Card>
      </Stack>
    </main>
  );
}
