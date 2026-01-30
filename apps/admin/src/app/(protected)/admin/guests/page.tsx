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
  Typography,
  Alert,
  Stack,
  Grid,
  Chip,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

type Guest = {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  loyaltyTier: string;
  notes: string | null;
};

const TIERS = ["NONE", "SILVER", "GOLD", "PLATINUM"] as const;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  loyaltyTier: "NONE",
  notes: "",
};

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Guest[]>("guests");
      setGuests(data);
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

  function startEdit(guest: Guest) {
    setEditingId(guest.id);
    setForm({
      firstName: guest.firstName,
      lastName: guest.lastName,
      dob: guest.dob || "",
      phone: guest.phone || "",
      email: guest.email || "",
      addressLine1: guest.addressLine1 || "",
      addressLine2: guest.addressLine2 || "",
      city: guest.city || "",
      state: guest.state || "",
      postalCode: guest.postalCode || "",
      country: guest.country || "",
      loyaltyTier: guest.loyaltyTier || "NONE",
      notes: guest.notes || "",
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
    setError(null);

    const payload = {
      ...form,
      dob: form.dob || null,
      phone: form.phone || null,
      email: form.email || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
      notes: form.notes || null,
    };

    try {
      if (editingId) {
        await apiJson(`guests/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiJson("guests", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await loadData();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this guest?")) return;
    try {
      await apiJson(`guests/${id}`, { method: "DELETE" });
      await loadData();
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
      <PageHeader
        title="Guests"
        subtitle="Manage guest profiles and loyalty status"
        action={
          !showForm ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
            >
              New Guest
            </Button>
          ) : null
        }
      />

      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

       {showForm && (
        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        {editingId ? "Edit Guest" : "Create New Guest"}
                    </Typography>
                    <IconButton onClick={resetForm} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={form.dob}
                                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                fullWidth
                                label="Loyalty Tier"
                                value={form.loyaltyTier}
                                onChange={(e) => setForm({ ...form, loyaltyTier: e.target.value })}
                            >
                                {TIERS.map((tier) => (
                                    <MenuItem key={tier} value={tier}>
                                        {tier}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                             <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Address
                            </Typography>
                             <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Address Line 1"
                                        value={form.addressLine1}
                                        onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Address Line 2"
                                        value={form.addressLine2}
                                        onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="State"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Postal Code"
                                        value={form.postalCode}
                                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Country"
                                        value={form.country}
                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                    />
                                </Grid>
                             </Grid>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Notes"
                                multiline
                                rows={2}
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button onClick={resetForm} variant="outlined">
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained"
                                >
                                    {editingId ? "Update Guest" : "Create Guest"}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Tier</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {guests
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((guest, index) => (
                    <TableRow key={guest.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                                {guest.firstName} {guest.lastName}
                            </Typography>
                        </TableCell>
                        <TableCell>{guest.email || "-"}</TableCell>
                        <TableCell>
                            <Chip 
                                label={guest.loyaltyTier} 
                                size="small" 
                                color={
                                    guest.loyaltyTier === "PLATINUM" ? "primary" : 
                                    guest.loyaltyTier === "GOLD" ? "warning" : "default"
                                }
                                variant={guest.loyaltyTier === "NONE" ? "outlined" : "filled"}
                            />
                        </TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(guest)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(guest.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {guests.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No guests found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={guests.length}
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
