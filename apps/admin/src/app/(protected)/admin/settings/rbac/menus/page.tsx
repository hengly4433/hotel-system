"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacMenu } from "@/lib/types/rbac";
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
  TablePagination,
  Collapse,
  alpha,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

const EMPTY_FORM = {
  key: "",
  label: "",
  sortOrder: "0"
};

export default function MenusPage() {
  const [menus, setMenus] = useState<RbacMenu[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const data = await apiJson<RbacMenu[]>("rbac/menus");
      setMenus(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(menu: RbacMenu) {
    setEditingId(menu.id);
    setForm({
      key: menu.key,
      label: menu.label,
      sortOrder: String(menu.sortOrder ?? 0)
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
      label: form.label,
      sortOrder: Number(form.sortOrder || 0)
    };

    try {
      if (editingId) {
        await apiJson(`rbac/menus/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rbac/menus", {
          method: "POST",
          body: JSON.stringify({
            key: form.key,
            ...payload
          })
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

  async function handleDelete(menuId: string) {
    if (!confirm("Delete this menu?")) return;
    try {
      await apiJson(`rbac/menus/${menuId}`, { method: "DELETE" });
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
    <Box component="main">
      <PageHeader 
        title="Menus" 
        subtitle="Top-level navigation groups"
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
              New Menu
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
                    <MenuIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Menu" : "Create New Menu"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update menu details" : "Add a new navigation menu"}
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
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      id="menu-key"
                      label="Key"
                      value={form.key}
                      onChange={(e) => setForm({ ...form, key: e.target.value })}
                      required
                      disabled={!!editingId}
                      fullWidth
                      helperText="Unique identifier"
                      InputLabelProps={{ shrink: true }}
                      placeholder="e.g., settings, reports"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      id="menu-label"
                      label="Label"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="Display name"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      id="menu-sort-order"
                      label="Sort Order"
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                      fullWidth
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
                        disabled={loading}
                        sx={{ 
                          px: 4,
                          boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                      >
                        {loading ? "Saving..." : editingId ? "Update Menu" : "Create Menu"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Table Card */}
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
                  <TableCell>Key</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Sort</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <MenuIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No menus found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first navigation menu
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Menu
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  menus
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((menu, index) => (
                    <TableRow 
                      key={menu.id} 
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
                            bgcolor: tokens.colors.grey[100], 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 1, 
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                          }}
                        >
                          {menu.key}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{menu.label}</TableCell>
                      <TableCell>{menu.sortOrder}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(menu)}
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
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(menu.id)}
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
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {menus.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={menus.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Card>
      </Stack>
    </Box>
  );
}
