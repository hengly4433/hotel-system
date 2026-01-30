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
  Grid,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

type Property = {
  id: string;
  name: string;
};

type CancellationPolicy = {
  id: string;
  propertyId: string;
  name: string;
  rules: string;
};

const EMPTY_FORM = {
  propertyId: "",
  name: "",
  rules: "{}"
};

export default function CancellationPoliciesPage() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const [policyData, propertyData] = await Promise.all([
        apiJson<CancellationPolicy[]>("cancellation-policies"),
        apiJson<Property[]>("properties")
      ]);
      setPolicies(policyData);
      setProperties(propertyData);
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

  function startEdit(policy: CancellationPolicy) {
    setEditingId(policy.id);
    setForm({
      propertyId: policy.propertyId,
      name: policy.name,
      rules: policy.rules || "{}"
    });
    setRulesError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setRulesError(null);
  }

  function validateRulesJson(value: string) {
    try {
      JSON.parse(value);
      setRulesError(null);
      return true;
    } catch (err) {
      setRulesError("Rules must be valid JSON.");
      return false;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateRulesJson(form.rules)) {
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      name: form.name,
      rules: form.rules
    };

    try {
      if (editingId) {
        await apiJson(`cancellation-policies/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("cancellation-policies", {
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
    if (!confirm("Delete this cancellation policy?")) return;
    try {
      await apiJson(`cancellation-policies/${id}`, { method: "DELETE" });
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
      <PageHeader title="Cancellation Policies" subtitle="Manage cancellation rules" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Policy" : "Create Policy"}
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
                                label="Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Rules (JSON)"
                                multiline
                                rows={6}
                                value={form.rules}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setForm({ ...form, rules: value });
                                    validateRulesJson(value);
                                }}
                                error={!!rulesError}
                                helperText={rulesError}
                                required
                                fullWidth
                                InputProps={{ style: { fontFamily: 'monospace' } }}
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
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {policies
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((policy, index) => (
                    <TableRow key={policy.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{policy.name}</TableCell>
                        <TableCell>{propertyMap.get(policy.propertyId) || policy.propertyId}</TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(policy)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(policy.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {policies.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No policies found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={policies.length}
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
