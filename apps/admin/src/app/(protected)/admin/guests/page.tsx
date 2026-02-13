"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
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
  Chip,
  TablePagination,
  Avatar,
  alpha,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
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

const TIER_COLORS: Record<string, { bg: string; color: string; gradient?: string }> = {
  NONE: { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] },
  SILVER: { bg: alpha('#94a3b8', 0.15), color: '#475569', gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
  GOLD: { bg: alpha('#f59e0b', 0.15), color: '#b45309', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
  PLATINUM: { bg: alpha('#8b5cf6', 0.15), color: '#6d28d9', gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' },
};

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState<string | null>(null);
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
          <Link href="/admin/guests/new" passHref>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
              }}
            >
              New Guest
            </Button>
          </Link>
        }
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
                          <Link href="/admin/guests/new" passHref>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              size="small"
                            >
                              Add Guest
                            </Button>
                          </Link>
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
                            <Link href={`/admin/guests/${guest.id}`} passHref>
                              <IconButton 
                                size="small" 
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
                            </Link>
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
