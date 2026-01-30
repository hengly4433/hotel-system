"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacRole, RbacUser } from "@/lib/types/rbac";
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
  FormGroup,
  FormLabel,
  TablePagination,
  Autocomplete
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

const EMPTY_FORM = {
  email: "",
  password: "",
  newPassword: "",
  status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
  propertyId: "",
  roleIds: [] as string[]
};

export default function UsersPage() {
  const [users, setUsers] = useState<RbacUser[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleMap = useMemo(() => {
    return new Map(roles.map((role) => [role.id, role.name]));
  }, [roles]);

  async function loadData() {
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        apiJson<RbacUser[]>("rbac/users"),
        apiJson<RbacRole[]>("rbac/roles")
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(user: RbacUser) {
    setEditingId(user.id);
    setForm({
      email: user.email,
      password: "",
      newPassword: "",
      status: user.status,
      propertyId: user.propertyId || "",
      roleIds: user.roleIds || []
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
      email: form.email,
      status: form.status,
      propertyId: form.propertyId || null
    };

    try {
      if (editingId) {
        await apiJson(`rbac/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        if (form.newPassword.trim()) {
          await apiJson(`rbac/users/${editingId}/password`, {
            method: "PUT",
            body: JSON.stringify({ password: form.newPassword })
          });
        }

        await apiJson(`rbac/users/${editingId}/roles`, {
          method: "PUT",
          body: JSON.stringify({ roleIds: form.roleIds })
        });
      } else {
        await apiJson("rbac/users", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            password: form.password,
            roleIds: form.roleIds
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

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user?")) return;
    try {
      await apiJson(`rbac/users/${userId}`, { method: "DELETE" });
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
      <PageHeader title="Users" subtitle="Manage staff accounts" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit User" : "Create User"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="user-email"
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                fullWidth
                            />
                        </Grid>
                        
                        {!editingId ? (
                             <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    id="user-password"
                                    label="Password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    fullWidth
                                />
                             </Grid>
                        ) : (
                             <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    id="user-new-password"
                                    label="New Password (Optional)"
                                    type="password"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    fullWidth
                                    helperText="Leave blank to keep current password"
                                />
                             </Grid>
                        )}
                        
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="user-status"
                                select
                                label="Status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "SUSPENDED" })}
                                fullWidth
                            >
                                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                             <TextField
                                id="user-property-id"
                                label="Property ID (Optional)"
                                value={form.propertyId}
                                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                                fullWidth
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                id="user-roles"
                                options={roles}
                                getOptionLabel={(option) => option.name}
                                value={roles.filter((r) => form.roleIds.includes(r.id))}
                                onChange={(event, newValue) => {
                                    setForm({
                                        ...form,
                                        roleIds: newValue.map((r) => r.id)
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Roles"
                                        placeholder="Select roles..."
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            variant="outlined"
                                            label={option.name}
                                            {...getTagProps({ index })}
                                            key={option.id}
                                        />
                                    ))
                                }
                                ListboxProps={{
                                    style: { maxHeight: 300 }
                                }}
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
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Roles</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user, index) => (
                    <TableRow key={user.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Chip 
                                label={user.status} 
                                size="small" 
                                color={user.status === "ACTIVE" ? "success" : "error"} 
                            />
                        </TableCell>
                        <TableCell>
                            {(user.roleIds || []).map((roleId) => (
                                <Chip 
                                    key={roleId} 
                                    label={roleMap.get(roleId) || roleId} 
                                    size="small" 
                                    sx={{ mr: 0.5, mb: 0.5 }} 
                                />
                            ))}
                        </TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(user)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(user.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {users.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No users found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={users.length}
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
