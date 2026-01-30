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
  Chip,
  Checkbox,
  FormControlLabel,
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

type Property = {
  id: string;
  name: string;
};

type TaxFee = {
  id: string;
  propertyId: string;
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  appliesTo: string;
  active: boolean;
};

const EMPTY_FORM = {
  propertyId: "",
  name: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: "",
  appliesTo: "ALL",
  active: true
};

export default function TaxesFeesPage() {
  const [taxesFees, setTaxesFees] = useState<TaxFee[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const [feesData, propertiesData] = await Promise.all([
        apiJson<TaxFee[]>("taxes-fees"),
        apiJson<Property[]>("properties")
      ]);
      setTaxesFees(feesData);
      setProperties(propertiesData);
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

  function startEdit(item: TaxFee) {
    setEditingId(item.id);
    setForm({
      propertyId: item.propertyId,
      name: item.name,
      type: item.type,
      value: String(item.value),
      appliesTo: item.appliesTo,
      active: item.active
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
      name: form.name,
      type: form.type,
      value: Number(form.value),
      appliesTo: form.appliesTo,
      active: form.active
    };

    try {
      if (editingId) {
        await apiJson(`taxes-fees/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("taxes-fees", {
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
    if (!confirm("Delete this tax/fee?")) return;
    try {
      await apiJson(`taxes-fees/${id}`, { method: "DELETE" });
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
      <PageHeader title="Taxes & Fees" subtitle="Manage tax and fee rules" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

       <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Tax/Fee" : "Create Tax/Fee"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
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
                        
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select
                                label="Type"
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value as TaxFee["type"] })}
                                fullWidth
                            >
                                <MenuItem value="PERCENT">Percent</MenuItem>
                                <MenuItem value="FIXED">Fixed</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                type="number"
                                label="Value"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                required
                                fullWidth
                                inputProps={{ step: "0.0001" }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select
                                label="Applies To"
                                value={form.appliesTo}
                                onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                <MenuItem value="ROOM">Room</MenuItem>
                                <MenuItem value="SERVICE">Service</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                             <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.active}
                                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                    />
                                }
                                label="Active"
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
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Applies To</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {taxesFees
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((item, index) => (
                    <TableRow key={item.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.value}</TableCell>
                        <TableCell>{item.appliesTo}</TableCell>
                        <TableCell>{propertyMap.get(item.propertyId) || item.propertyId}</TableCell>
                        <TableCell>
                             <Chip 
                                label={item.active ? "Active" : "Disabled"} 
                                size="small" 
                                color={item.active ? "success" : "default"} 
                            />
                        </TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(item)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {taxesFees.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No taxes/fees found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={taxesFees.length}
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
