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
  Grid,
  Chip,
  Checkbox,
  FormControlLabel,
  TablePagination,
  Collapse,
  alpha,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Close as CloseIcon,
  Receipt as TaxIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

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
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const selectedProperty = useMemo(() => 
    properties.find(p => p.id === form.propertyId) || null,
  [properties, form.propertyId]);

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

  return (
    <Box component="main">
      <PageHeader 
        title="Taxes & Fees" 
        subtitle="Manage tax and fee rules"
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
              New Tax/Fee
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
                    <TaxIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Tax/Fee" : "Create New Tax/Fee"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update tax or fee details" : "Add a new tax or fee rule"}
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
                        setForm({ ...form, propertyId: newValue?.id || "" });
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
                    <TextField
                      label="Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Type"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as TaxFee["type"] })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                        {loading ? "Saving..." : editingId ? "Update Tax/Fee" : "Create Tax/Fee"}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Applies To</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxesFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TaxIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No taxes or fees found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first tax or fee rule
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Tax/Fee
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  taxesFees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                    <TableRow 
                      key={item.id} 
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
                      <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.type} 
                          size="small"
                          sx={{
                            bgcolor: tokens.colors.grey[100],
                            color: tokens.colors.grey[700],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        >
                          {item.value}{item.type === "PERCENT" ? "%" : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.appliesTo}</TableCell>
                      <TableCell>{propertyMap.get(item.propertyId) || item.propertyId}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.active ? "Active" : "Disabled"} 
                          size="small"
                          sx={{
                            bgcolor: item.active ? alpha("#22c55e", 0.15) : tokens.colors.grey[100],
                            color: item.active ? "#166534" : tokens.colors.grey[600],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(item)}
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
                            onClick={() => handleDelete(item.id)}
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
          {taxesFees.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={taxesFees.length}
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
