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
  TablePagination
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

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
    <main>
      <PageHeader title="Menus" subtitle="Top-level navigation groups" />

      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Menu" : "Create Menu"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
                    <TableCell>Sort</TableCell>
                    <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {menus
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((menu, index) => (
                    <TableRow key={menu.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{menu.key}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{menu.label}</TableCell>
                        <TableCell>{menu.sortOrder}</TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(menu)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(menu.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {menus.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No menus found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={menus.length}
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
