"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Stack,
  Chip,
  TablePagination,
  alpha,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  Search as SearchIcon,
  Receipt as FolioIcon,
  OpenInNew as OpenIcon,
  CheckCircle as ClosedIcon,
  Block as VoidIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Folio = {
  id: string;
  reservationId: string;
  status: string;
  currency: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  OPEN: { 
    label: "Open", 
    color: "#166534", 
    bg: alpha("#22c55e", 0.15),
    icon: <OpenIcon sx={{ fontSize: 16 }} />,
  },
  CLOSED: { 
    label: "Closed", 
    color: "#1d4ed8", 
    bg: alpha("#3b82f6", 0.15),
    icon: <ClosedIcon sx={{ fontSize: 16 }} />,
  },
  VOID: { 
    label: "Void", 
    color: "#b91c1c", 
    bg: alpha("#ef4444", 0.15),
    icon: <VoidIcon sx={{ fontSize: 16 }} />,
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KHR: "៛",
};

export default function FoliosPage() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Folio[]>("folios");
      setFolios(data);
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

  // Filter folios based on search
  const filteredFolios = folios.filter((folio) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      folio.id.toLowerCase().includes(query) ||
      folio.reservationId.toLowerCase().includes(query)
    );
  });

  const paginatedFolios = filteredFolios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Summary counts
  const openCount = folios.filter(f => f.status === "OPEN").length;
  const closedCount = folios.filter(f => f.status === "CLOSED").length;
  const voidCount = folios.filter(f => f.status === "VOID").length;

  return (
    <Box component="main">
      <PageHeader 
        title="Folios" 
        subtitle="Balances and payments"
      />
      
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Card 
            sx={{ 
              flex: 1,
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha("#22c55e", 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <OpenIcon sx={{ color: "#22c55e", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {openCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Open Folios
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              flex: 1,
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha("#3b82f6", 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ClosedIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {closedCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Closed Folios
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              flex: 1,
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
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
                  <FolioIcon sx={{ color: tokens.colors.primary.main, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {folios.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Total Folios
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Main Table Card */}
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
                All Folios
              </Typography>
              <TextField
                placeholder="Search by ID or reservation..."
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
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>FOLIO ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>RESERVATION</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>CURRENCY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600] }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFolios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <FolioIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No folios found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery ? "Try a different search term" : "Folios will appear when reservations are created"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFolios.map((folio, index) => {
                    const status = STATUS_CONFIG[folio.status] || STATUS_CONFIG.OPEN;
                    const currencySymbol = CURRENCY_SYMBOLS[folio.currency] || folio.currency;

                    return (
                      <TableRow 
                        key={folio.id} 
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
                          <Link 
                            href={`/admin/finance/folios/${folio.id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Chip 
                              label={folio.id.substring(0, 8) + "..."}
                              size="small"
                              sx={{ 
                                fontFamily: 'monospace',
                                bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                color: tokens.colors.primary.main,
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: alpha(tokens.colors.primary.main, 0.15),
                                }
                              }}
                            />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontFamily: 'monospace',
                              color: tokens.colors.grey[600],
                            }}
                          >
                            {folio.reservationId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={status.icon as React.ReactElement}
                            label={status.label}
                            size="small"
                            sx={{
                              bgcolor: status.bg,
                              color: status.color,
                              fontWeight: 600,
                              height: 24,
                              '& .MuiChip-icon': {
                                color: status.color,
                                fontSize: 16
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <MoneyIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                            <Typography variant="body2" fontWeight={600} color={tokens.colors.grey[700]}>
                              {currencySymbol} {folio.currency}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View folio details">
                            <IconButton
                              component={Link}
                              href={`/admin/finance/folios/${folio.id}`}
                              size="small"
                              sx={{
                                color: tokens.colors.primary.main,
                                '&:hover': {
                                  bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredFolios.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredFolios.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: `1px solid ${tokens.colors.grey[200]}` }}
            />
          )}
        </Card>
      </Stack>
    </Box>
  );
}
