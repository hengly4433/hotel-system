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
  TablePagination,
  Collapse,
  alpha,
  Autocomplete,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  FilterList as FilterListIcon,
  Close as CloseIcon,
  AttachMoney as PriceIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

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
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const selectedRatePlan = useMemo(() => 
    ratePlans.find(p => p.id === form.ratePlanId) || null,
  [ratePlans, form.ratePlanId]);

  const selectedRoomType = useMemo(() => 
    roomTypes.find(t => t.id === form.roomTypeId) || null,
  [roomTypes, form.roomTypeId]);

  const selectedFilterRatePlan = useMemo(() => 
    ratePlans.find(p => p.id === filters.ratePlanId) || null,
  [ratePlans, filters.ratePlanId]);

  const selectedFilterRoomType = useMemo(() => 
    roomTypes.find(t => t.id === filters.roomTypeId) || null,
  [roomTypes, filters.roomTypeId]);

  function startEdit(price: RatePlanPrice) {
    setEditingId(price.id);
    setForm({
      ratePlanId: price.ratePlanId,
      roomTypeId: price.roomTypeId,
      date: price.date,
      price: String(price.price),
      currency: price.currency
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
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

  return (
    <Box component="main">
      <PageHeader 
        title="Nightly Prices" 
        subtitle="Manage nightly rate plan prices"
        action={
          !showForm ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
              }}
            >
              New Price
            </Button>
          ) : null
        }
      />
      
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters Card */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  options={ratePlans}
                  getOptionLabel={(option) => `${option.code} — ${option.name}`}
                  value={selectedFilterRatePlan}
                  onChange={(_, newValue) => {
                    setFilters({ ...filters, ratePlanId: newValue?.id || "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rate Plan"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  options={roomTypes}
                  getOptionLabel={(option) => option.name}
                  value={selectedFilterRoomType}
                  onChange={(_, newValue) => {
                    setFilters({ ...filters, roomTypeId: newValue?.id || "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Room Type"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
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

        {/* Collapsible Form */}
        <Collapse in={showForm}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: alpha(tokens.colors.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PriceIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Price" : "Create New Price"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update nightly price" : "Add a new nightly rate"}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={resetForm} 
                  size="small"
                  sx={{
                    bgcolor: tokens.colors.grey[100],
                    '&:hover': { bgcolor: tokens.colors.grey[200] }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={ratePlans}
                      getOptionLabel={(option) => `${option.code} — ${option.name}`}
                      value={selectedRatePlan}
                      onChange={(_, newValue) => {
                        setForm({ ...form, ratePlanId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Rate Plan"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={roomTypes}
                      getOptionLabel={(option) => option.name}
                      value={selectedRoomType}
                      onChange={(_, newValue) => {
                        setForm({ ...form, roomTypeId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Room Type"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
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
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Currency"
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        sx={{
                          boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                      >
                        {loading ? "Saving..." : editingId ? "Update Price" : "Create Price"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Table */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Rate Plan</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PriceIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No prices found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first nightly price
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Price
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  prices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((price, index) => (
                    <TableRow 
                      key={price.id} 
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
                      <TableCell sx={{ fontWeight: 500 }}>{price.date}</TableCell>
                      <TableCell>{ratePlanMap.get(price.ratePlanId) || price.ratePlanId}</TableCell>
                      <TableCell>{roomTypeMap.get(price.roomTypeId) || price.roomTypeId}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: tokens.colors.primary.main,
                          }}
                        >
                          {price.price} {price.currency}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(price)}
                            sx={{
                              bgcolor: alpha(tokens.colors.primary.main, 0.08),
                              color: tokens.colors.primary.main,
                              '&:hover': { bgcolor: alpha(tokens.colors.primary.main, 0.15) }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(price.id)}
                            sx={{
                              bgcolor: alpha(tokens.colors.error.main, 0.08),
                              color: tokens.colors.error.main,
                              '&:hover': { bgcolor: alpha(tokens.colors.error.main, 0.15) }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {prices.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={prices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </Card>
      </Stack>
    </Box>
  );
}
