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
  TablePagination,
  Autocomplete,
  Collapse,
  alpha,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

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
  const [showForm, setShowForm] = useState(false);

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
    <Box component="main">
      <PageHeader 
        title="Users" 
        subtitle="Manage staff accounts"
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
              New User
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
                    <PersonIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit User" : "Create New User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update user account details" : "Add a new staff account"}
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
                      id="user-email"
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="user@example.com"
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
                        InputLabelProps={{ shrink: true }}
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
                        InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                          InputLabelProps={{ shrink: true }}
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
                        {loading ? "Saving..." : editingId ? "Update User" : "Create User"}
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
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No users found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Add your first staff account
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add User
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user, index) => (
                    <TableRow 
                      key={user.id} 
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
                      <TableCell sx={{ fontWeight: 600 }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          sx={{
                            bgcolor: user.status === "ACTIVE" 
                              ? alpha(tokens.colors.success.main, 0.12)
                              : alpha(tokens.colors.error.main, 0.12),
                            color: user.status === "ACTIVE"
                              ? tokens.colors.success.dark
                              : tokens.colors.error.dark,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {(user.roleIds || []).map((roleId) => (
                            <Chip 
                              key={roleId} 
                              label={roleMap.get(roleId) || roleId} 
                              size="small"
                              sx={{
                                bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                color: tokens.colors.primary.main,
                                fontWeight: 600,
                              }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(user)}
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
                            onClick={() => handleDelete(user.id)}
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
          {users.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
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
