"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacMenu, RbacSubmenu } from "@/lib/types/rbac";
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
  TablePagination,
  Collapse,
  alpha,
  Chip,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Close as CloseIcon,
  SubdirectoryArrowRight as SubmenuIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

const EMPTY_FORM = {
  menuId: "",
  key: "",
  label: "",
  route: "",
  sortOrder: "0"
};

export default function SubmenusPage() {
  const [submenus, setSubmenus] = useState<RbacSubmenu[]>([]);
  const [menus, setMenus] = useState<RbacMenu[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const [submenuData, menuData] = await Promise.all([
        apiJson<RbacSubmenu[]>("rbac/submenus"),
        apiJson<RbacMenu[]>("rbac/menus")
      ]);
      setSubmenus(submenuData);
      setMenus(menuData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(submenu: RbacSubmenu) {
    setEditingId(submenu.id);
    setForm({
      menuId: submenu.menuId,
      key: submenu.key,
      label: submenu.label,
      route: submenu.route,
      sortOrder: String(submenu.sortOrder ?? 0)
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
      menuId: form.menuId || null,
      key: form.key,
      label: form.label,
      route: form.route,
      sortOrder: Number(form.sortOrder || 0)
    };

    try {
      if (editingId) {
        await apiJson(`rbac/submenus/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rbac/submenus", {
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

  async function handleDelete(submenuId: string) {
    if (!confirm("Delete this submenu?")) return;
    try {
      await apiJson(`rbac/submenus/${submenuId}`, { method: "DELETE" });
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
        title="Submenus" 
        subtitle="Menu children with routes"
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
              New Submenu
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
                    <SubmenuIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Submenu" : "Create New Submenu"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update submenu details" : "Add a new navigation submenu"}
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
                      id="submenu-parent-menu"
                      select
                      label="Parent Menu"
                      value={form.menuId}
                      onChange={(e) => setForm({ ...form, menuId: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">Select menu</MenuItem>
                      {menus.map((menu) => (
                        <MenuItem key={menu.id} value={menu.id}>
                          {menu.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="submenu-key"
                      label="Key"
                      value={form.key}
                      onChange={(e) => setForm({ ...form, key: e.target.value })}
                      required
                      fullWidth
                      helperText="Unique identifier for navigation"
                      InputLabelProps={{ shrink: true }}
                      placeholder="e.g., users, roles"
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="submenu-label"
                      label="Label"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="Display name"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="submenu-route"
                      label="Route / Path"
                      value={form.route}
                      onChange={(e) => setForm({ ...form, route: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="/admin/..."
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="submenu-sort-order"
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
                        {loading ? "Saving..." : editingId ? "Update Submenu" : "Create Submenu"}
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
                  <TableCell>Route</TableCell>
                  <TableCell>Parent Menu</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submenus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SubmenuIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No submenus found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Create your first navigation submenu
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Submenu
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  submenus
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((submenu, index) => (
                    <TableRow 
                      key={submenu.id} 
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
                          {submenu.key}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{submenu.label}</TableCell>
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
                          {submenu.route}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={menus.find((m) => m.id === submenu.menuId)?.label || submenu.menuId}
                          size="small"
                          sx={{
                            bgcolor: alpha(tokens.colors.primary.main, 0.08),
                            color: tokens.colors.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(submenu)}
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
                            onClick={() => handleDelete(submenu.id)}
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
          {submenus.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={submenus.length}
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
