"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { useToast } from "@/contexts/ToastContext";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  MenuItem,
  Chip,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { alpha } from "@mui/material/styles";

const EMPTY_ITEM = {
  type: "ROOM_CHARGE",
  description: "",
  qty: 1,
  unitPrice: 0
};

const EMPTY_PAYMENT = {
  method: "CARD",
  amount: 0,
  currency: "USD",
  status: "CAPTURED",
  provider: "",
  providerRef: "",
  idempotencyKey: ""
};

const CHARGE_TYPES = [
  { value: "ROOM_CHARGE", label: "Room Charge" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "MINIBAR", label: "Minibar" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "MISC", label: "Miscellaneous" },
];

const PAYMENT_METHODS = [
  { value: "CARD", label: "Credit Card" },
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "Bank Transfer" },
];

export default function FolioDetailPage() {
  const params = useParams();
  const folioId = params?.id as string | undefined;
  const { showSuccess, showError } = useToast();

  const [folio, setFolio] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!folioId) return;
    try {
      const data = await apiJson<any>(`folios/${folioId}`);
      setFolio(data);
      setItems(data.items || []);
      setPayments(data.payments || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [folioId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function addItem() {
    if (!folioId || loading) return;
    setLoading(true);
    try {
      await apiJson(`folios/${folioId}/items`, {
        method: "POST",
        body: JSON.stringify(itemForm)
      });
      showSuccess("Item added successfully");
      setItemForm(EMPTY_ITEM);
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function addPayment() {
    if (!folioId || loading) return;
    setLoading(true);
    try {
      await apiJson(`folios/${folioId}/payments`, {
        method: "POST",
        body: JSON.stringify(paymentForm)
      });
      showSuccess("Payment processed successfully");
      setPaymentForm(EMPTY_PAYMENT);
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function closeFolio() {
    if (!folioId || loading) return;
    setLoading(true);
    try {
      await apiJson(`folios/${folioId}/close`, { method: "POST" });
      showSuccess("Folio closed successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return { color: "#166534", bg: alpha("#22c55e", 0.15) };
      case "CLOSED": return { color: "#1d4ed8", bg: alpha("#3b82f6", 0.15) };
      case "VOID": return { color: "#b91c1c", bg: alpha("#ef4444", 0.15) };
      default: return { color: tokens.colors.grey[700], bg: tokens.colors.grey[100] };
    }
  };

  const statusStyle = folio ? getStatusColor(folio.status) : { color: "", bg: "" };

  return (
    <Box component="main">
      <PageHeader 
        title="Folio Details" 
        subtitle={`ID: ${folioId}`}
        action={
          folio?.status === "OPEN" && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={closeFolio}
              disabled={loading}
              startIcon={<CheckIcon />}
              sx={{ boxShadow: `0 4px 14px ${tokens.colors.primary.main}40` }}
            >
              Close Folio
            </Button>
          )
        }
      />
      
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {folio && (
          <Card 
            sx={{ 
              borderRadius: "18px", 
              boxShadow: tokens.shadows.card,
              border: `1px solid ${tokens.colors.grey[200]}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    STATUS
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={folio.status} 
                      sx={{ 
                        bgcolor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 700,
                        borderRadius: 1
                      }} 
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    RESERVATION
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                    {folio.reservationId}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                   <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    CURRENCY
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                     {folio.currency}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Items Section */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card 
              sx={{ 
                borderRadius: "18px", 
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                height: '100%'
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Charges & Items
                </Typography>
                <Chip label={`${items.length} Items`} size="small" variant="outlined" />
              </Box>
              
              <TableContainer component={Box} sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>DESCRIPTION</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>QTY</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>PRICE</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>TOTAL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                           No charges added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item: any) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                             <Chip label={item.type} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{item.description}</TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">{item.unitPrice?.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {(item.qty * item.unitPrice)?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {folio?.status === "OPEN" && (
                <Box sx={{ p: 3, borderTop: `1px solid ${tokens.colors.grey[200]}`, bgcolor: tokens.colors.grey[50] }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Add New Charge
                  </Typography>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        select
                        label="Type"
                        fullWidth
                        size="small"
                        value={itemForm.type}
                        onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                        sx={{ bgcolor: 'white' }}
                      >
                        {CHARGE_TYPES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Description"
                        fullWidth
                        size="small"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 1.5 }}>
                      <TextField
                        label="Qty"
                        type="number"
                        fullWidth
                        size="small"
                        value={itemForm.qty}
                        onChange={(e) => setItemForm({ ...itemForm, qty: Number(e.target.value) })}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        label="Price"
                        type="number"
                        fullWidth
                        size="small"
                        value={itemForm.unitPrice}
                        onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 1.5 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={addItem}
                        disabled={loading}
                        sx={{ height: 40, bgcolor: tokens.colors.primary.main }}
                      >
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Payments Section */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card 
              sx={{ 
                borderRadius: "18px", 
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                height: '100%'
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.grey[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Payments
                </Typography>
                <Chip label={`${payments.length} Trans`} size="small" variant="outlined" />
              </Box>

              <TableContainer component={Box} sx={{ maxHeight: 300, overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>METHOD</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>AMOUNT</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: tokens.colors.grey[600], bgcolor: alpha(tokens.colors.primary.main, 0.04) }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                           No payments recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment: any) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                             <Typography variant="body2" fontWeight={600}>{payment.method}</Typography>
                             <Typography variant="caption" color="text.secondary">{payment.provider}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#166534' }}>
                            {payment.amount?.toFixed(2)} {payment.currency}
                          </TableCell>
                          <TableCell align="right">
                             <Chip label={payment.status} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {folio?.status === "OPEN" && (
                <Box sx={{ p: 3, borderTop: `1px solid ${tokens.colors.grey[200]}`, bgcolor: tokens.colors.grey[50] }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Record Payment
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        select
                        label="Method"
                        fullWidth
                        size="small"
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                        sx={{ bgcolor: 'white' }}
                      >
                         {PAYMENT_METHODS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Amount"
                        type="number"
                        fullWidth
                        size="small"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                       <Button
                        variant="contained"
                        fullWidth
                        onClick={addPayment}
                        disabled={loading}
                        startIcon={<PaymentIcon />}
                        sx={{ 
                          bgcolor: tokens.colors.primary.main,
                          height: 40,
                          boxShadow: tokens.shadows.sm 
                        }}
                      >
                        Process Payment
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
