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
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

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
    <main>
      <PageHeader title="Submenus" subtitle="Menu children with routes" />

      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Submenu" : "Create Submenu"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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

        <Card>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                <TableHead>
                    <TableRow>
                     <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell>Key</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Parent Menu</TableCell>
                    <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {submenus
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((submenu, index) => (
                    <TableRow key={submenu.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{submenu.key}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{submenu.label}</TableCell>
                        <TableCell>
                            <Box 
                                component="span" 
                                sx={{ 
                                    bgcolor: 'background.default', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1, 
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {submenu.route}
                            </Box>
                        </TableCell>
                        <TableCell>{menus.find((m) => m.id === submenu.menuId)?.label || submenu.menuId}</TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(submenu)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(submenu.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {submenus.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No submenus found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={submenus.length}
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
