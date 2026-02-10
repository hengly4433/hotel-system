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
  TablePagination,
  Avatar,
  alpha,
  Collapse,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

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

const TIER_COLORS: Record<string, { bg: string; color: string; gradient?: string }> = {
  NONE: { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] },
  SILVER: { bg: alpha('#94a3b8', 0.15), color: '#475569', gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
  GOLD: { bg: alpha('#f59e0b', 0.15), color: '#b45309', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
  PLATINUM: { bg: alpha('#8b5cf6', 0.15), color: '#6d28d9', gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' },
};

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { showSuccess, showError } = useToast();

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
        showSuccess("Guest updated successfully");
      } else {
        await apiJson("guests", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showSuccess("Guest created successfully");
      }
      await loadData();
      resetForm();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`guests/${deleteId}`, { method: "DELETE" });
      showSuccess("Guest deleted successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
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

  const filteredGuests = guests.filter((guest) => {
    const query = searchQuery.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(query) ||
      guest.lastName.toLowerCase().includes(query) ||
      (guest.email && guest.email.toLowerCase().includes(query)) ||
      (guest.phone && guest.phone.includes(query))
    );
  });

  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  function getAvatarColor(name: string) {
    const colors = [
      tokens.colors.primary.main,
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#22c55e',
      '#06b6d4',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <Box component="main">
      <PageHeader
        title="Guests"
        subtitle="Manage guest profiles and loyalty status"
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
              New Guest
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

        {/* Form Card */}
        <Collapse in={showForm}>
          <Card 
            sx={{ 
              borderRadius: "18px", 
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
                    <PersonIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Guest" : "Create New Guest"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update guest information" : "Add a new guest to the system"}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={resetForm} 
                  size="small"
                  sx={{
                    bgcolor: tokens.colors.grey[100],
                    '&:hover': {
                      bgcolor: tokens.colors.grey[200],
                    }
                  }}
                >
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
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
                    >
                      {TIERS.map((tier) => (
                        <MenuItem key={tier} value={tier}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {tier !== 'NONE' && <StarIcon sx={{ fontSize: 16, color: TIER_COLORS[tier].color }} />}
                            {tier}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: tokens.colors.grey[700] }}>
                      Address Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Address Line 1"
                          value={form.addressLine1}
                          onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Address Line 2"
                          value={form.addressLine2}
                          onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                          fullWidth
                          label="City"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                          fullWidth
                          label="State"
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Postal Code"
                          value={form.postalCode}
                          onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button 
                        onClick={resetForm} 
                        variant="outlined"
                        sx={{ px: 3 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        sx={{ 
                          px: 4,
                          boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                      >
                        {editingId ? "Update Guest" : "Create Guest"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        <Card 
          sx={{ 
            borderRadius: "18px", 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.grey[200]}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                Guest List
              </Typography>
              <TextField
                placeholder="Search by name, email, phone..."
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
                sx={{ width: 300 }}
              />
            </Stack>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>
                  <TableCell sx={{ width: 60, fontWeight: 700, color: tokens.colors.grey[600] }}>NO</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>GUEST</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>CONTACT</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>TIER</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                           No guests found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                           {searchQuery ? "Try a different search term" : "Get started by adding your first guest"}
                        </Typography>
                        {!searchQuery && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setShowForm(true)}
                            size="small"
                          >
                            Add Guest
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((guest, index) => (
                    <TableRow 
                      key={guest.id} 
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
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(guest.firstName),
                              width: 40,
                              height: 40,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(guest.firstName, guest.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {guest.firstName} {guest.lastName}
                            </Typography>
                            {guest.city && (
                              <Typography variant="caption" color="text.secondary">
                                {guest.city}{guest.country ? `, ${guest.country}` : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {guest.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 14, color: tokens.colors.grey[400] }} />
                              <Typography variant="body2">{guest.email}</Typography>
                            </Box>
                          )}
                          {guest.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: tokens.colors.grey[400] }} />
                              <Typography variant="body2">{guest.phone}</Typography>
                            </Box>
                          )}
                          {!guest.email && !guest.phone && (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={guest.loyaltyTier !== 'NONE' ? <StarIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                          label={guest.loyaltyTier} 
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: TIER_COLORS[guest.loyaltyTier]?.bg,
                            color: TIER_COLORS[guest.loyaltyTier]?.color,
                            ...(guest.loyaltyTier !== 'NONE' && {
                              '& .MuiChip-icon': {
                                color: TIER_COLORS[guest.loyaltyTier]?.color,
                              }
                            })
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => startEdit(guest)}
                              sx={{
                                bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                color: tokens.colors.primary.main,
                                '&:hover': {
                                  bgcolor: alpha(tokens.colors.primary.main, 0.15),
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => setDeleteId(guest.id)}
                              sx={{
                                bgcolor: alpha(tokens.colors.error.main, 0.08),
                                color: tokens.colors.error.main,
                                '&:hover': {
                                  bgcolor: alpha(tokens.colors.error.main, 0.15),
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredGuests.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredGuests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Card>
      </Stack>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Guest?"
        description="This will permanently remove this guest."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
