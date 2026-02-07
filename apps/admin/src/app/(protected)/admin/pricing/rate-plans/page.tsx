"use client";

import { useEffect, useMemo, useState } from "react";
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
  FormControlLabel,
  Checkbox,
  Grid,
  TablePagination,
  Collapse,
  alpha,
  Chip,
  Autocomplete,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Close as CloseIcon,
  Sell as RatePlanIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Property = {
  id: string;
  name: string;
};

type RatePlan = {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  refundable: boolean;
  includesBreakfast: boolean;
  cancellationPolicyId: string | null;
};

type CancellationPolicy = {
  id: string;
  propertyId: string;
  name: string;
};

const EMPTY_FORM = {
  propertyId: "",
  code: "",
  name: "",
  refundable: true,
  includesBreakfast: false,
  cancellationPolicyId: ""
};

export default function RatePlansPage() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  async function loadData() {
    setError(null);
    try {
      const [plansData, propertiesData, policiesData] = await Promise.all([
        apiJson<RatePlan[]>("rate-plans"),
        apiJson<Property[]>("properties"),
        apiJson<CancellationPolicy[]>("cancellation-policies")
      ]);
      setRatePlans(plansData);
      setProperties(propertiesData);
      setPolicies(policiesData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    properties.forEach((property) => map.set(property.id, property.name));
    return map;
  }, [properties]);

  const policyMap = useMemo(() => {
    const map = new Map<string, string>();
    policies.forEach((policy) => map.set(policy.id, policy.name));
    return map;
  }, [policies]);

  const visiblePolicies = useMemo(() => {
    if (!form.propertyId) return policies;
    return policies.filter((policy) => policy.propertyId === form.propertyId);
  }, [form.propertyId, policies]);

  const selectedProperty = useMemo(() => 
    properties.find(p => p.id === form.propertyId) || null,
  [properties, form.propertyId]);

  const selectedPolicy = useMemo(() => 
    policies.find(p => p.id === form.cancellationPolicyId) || null,
  [policies, form.cancellationPolicyId]);

  function startEdit(plan: RatePlan) {
    setEditingId(plan.id);
    setForm({
      propertyId: plan.propertyId,
      code: plan.code,
      name: plan.name,
      refundable: plan.refundable,
      includesBreakfast: plan.includesBreakfast,
      cancellationPolicyId: plan.cancellationPolicyId || ""
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
      propertyId: form.propertyId,
      code: form.code,
      name: form.name,
      refundable: form.refundable,
      includesBreakfast: form.includesBreakfast,
      cancellationPolicyId: form.cancellationPolicyId || null
    };

    try {
      if (editingId) {
        await apiJson(`rate-plans/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rate-plans", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rate plan?")) return;
    try {
      await apiJson(`rate-plans/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Box component="main">
      <PageHeader 
        title="Rate Plans" 
        subtitle="Manage pricing plans"
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
              New Rate Plan
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
                    <RatePlanIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Rate Plan" : "Create New Rate Plan"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update rate plan details" : "Add a new pricing plan"}
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
                      options={properties}
                      getOptionLabel={(option) => option.name}
                      value={selectedProperty}
                      onChange={(_, newValue) => {
                        setForm({ ...form, propertyId: newValue?.id || "", cancellationPolicyId: "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Property"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={visiblePolicies}
                      getOptionLabel={(option) => option.name}
                      value={selectedPolicy}
                      onChange={(_, newValue) => {
                        setForm({ ...form, cancellationPolicyId: newValue?.id || "" });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cancellation Policy"
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Code"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="e.g., BAR, ADV"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.refundable}
                            onChange={(e) => setForm({ ...form, refundable: e.target.checked })}
                          />
                        }
                        label="Refundable"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.includesBreakfast}
                            onChange={(e) => setForm({ ...form, includesBreakfast: e.target.checked })}
                          />
                        }
                        label="Includes breakfast"
                      />
                    </Stack>
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
                        {loading ? "Saving..." : editingId ? "Update Rate Plan" : "Create Rate Plan"}
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
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Policy</TableCell>
                  <TableCell>Refundable</TableCell>
                  <TableCell>Breakfast</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ratePlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <RatePlanIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No rate plans found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first pricing plan
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Rate Plan
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  ratePlans
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((plan, index) => (
                    <TableRow 
                      key={plan.id} 
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
                        <Box 
                          component="span" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            bgcolor: tokens.colors.grey[100], 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontWeight: 600,
                          }}
                        >
                          {plan.code}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{plan.name}</TableCell>
                      <TableCell>{propertyMap.get(plan.propertyId) || plan.propertyId}</TableCell>
                      <TableCell>
                        {plan.cancellationPolicyId
                          ? policyMap.get(plan.cancellationPolicyId) || plan.cancellationPolicyId
                          : <Typography variant="body2" color="text.secondary">-</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={plan.refundable ? "Yes" : "No"} 
                          size="small"
                          sx={{
                            bgcolor: plan.refundable ? alpha("#22c55e", 0.15) : alpha("#ef4444", 0.15),
                            color: plan.refundable ? "#166534" : "#b91c1c",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={plan.includesBreakfast ? "Yes" : "No"} 
                          size="small"
                          sx={{
                            bgcolor: plan.includesBreakfast ? alpha("#22c55e", 0.15) : tokens.colors.grey[100],
                            color: plan.includesBreakfast ? "#166534" : tokens.colors.grey[600],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(plan)}
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
                            onClick={() => handleDelete(plan.id)}
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
          {ratePlans.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={ratePlans.length}
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
