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
  FormControlLabel,
  Checkbox,
  Grid,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

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
    if (!form.propertyId) {
      return policies;
    }
    return policies.filter((policy) => policy.propertyId === form.propertyId);
  }, [form.propertyId, policies]);

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
      <PageHeader title="Rate Plans" subtitle="Manage pricing plans" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {editingId ? "Edit Rate Plan" : "Create Rate Plan"}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                 <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        select
                        label="Property"
                        value={form.propertyId}
                        onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                        required
                        fullWidth
                    >
                        <MenuItem value="">Select</MenuItem>
                        {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                            {property.name}
                        </MenuItem>
                        ))}
                    </TextField>
                 </Grid>
                 
                 <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        select
                        label="Cancellation Policy"
                        value={form.cancellationPolicyId}
                        onChange={(e) => setForm({ ...form, cancellationPolicyId: e.target.value })}
                        fullWidth
                    >
                        <MenuItem value="">None</MenuItem>
                        {visiblePolicies.map((policy) => (
                        <MenuItem key={policy.id} value={policy.id}>
                            {policy.name}
                        </MenuItem>
                        ))}
                    </TextField>
                 </Grid>

                 <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Code"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        required
                        fullWidth
                    />
                 </Grid>
                 <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        fullWidth
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
                    <Stack direction="row" spacing={2}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={loading}
                            startIcon={!editingId && !loading && <AddIcon />}
                        >
                            {loading ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
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
                    <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Policy</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Refundable</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Breakfast</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ratePlans
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((plan, index) => (
                    <TableRow key={plan.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                            <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                {plan.code}
                            </span>
                        </TableCell>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{propertyMap.get(plan.propertyId) || plan.propertyId}</TableCell>
                         <TableCell>
                            {plan.cancellationPolicyId
                                ? policyMap.get(plan.cancellationPolicyId) || plan.cancellationPolicyId
                                : <span style={{ color: '#94a3b8' }}>-</span>}
                        </TableCell>
                        <TableCell>{plan.refundable ? "Yes" : "No"}</TableCell>
                        <TableCell>{plan.includesBreakfast ? "Yes" : "No"}</TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(plan)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(plan.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {ratePlans.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No rate plans found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={ratePlans.length}
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
