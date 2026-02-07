"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacRole } from "@/lib/types/rbac";
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
  Tooltip,
  alpha,
  Chip,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Close as CloseIcon,
  AdminPanelSettings as RoleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

const EMPTY_FORM = {
  name: "",
  propertyId: ""
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const data = await apiJson<RbacRole[]>("rbac/roles");
      setRoles(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function startEdit(role: RbacRole) {
    setEditingId(role.id);
    setForm({
      name: role.name,
      propertyId: role.propertyId || ""
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
      name: form.name,
      propertyId: form.propertyId || null
    };

    try {
      if (editingId) {
        await apiJson(`rbac/roles/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("rbac/roles", {
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

  async function handleDelete(roleId: string) {
    if (!confirm("Delete this role?")) return;
    try {
      await apiJson(`rbac/roles/${roleId}`, { method: "DELETE" });
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
        title="Roles"
        subtitle="Define access profiles and assign permissions"
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
              New Role
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

        {/* Instruction Card */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: 'none',
            border: `1px solid ${alpha(tokens.colors.primary.main, 0.2)}`,
            bgcolor: alpha(tokens.colors.primary.main, 0.03),
          }}
        >
          <CardContent sx={{ py: 2.5, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(tokens.colors.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SecurityIcon sx={{ color: tokens.colors.primary.main, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                  How to assign permissions?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click on a role name below to configure its permissions and menu access. Permissions control what users can do, while menu access controls what they can see.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

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
                    <RoleIcon sx={{ color: tokens.colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {editingId ? "Edit Role" : "Create New Role"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingId ? "Update role details" : "Define a new access profile"}
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
                      fullWidth
                      label="Role Name"
                      placeholder="e.g., Front Desk, Manager, Housekeeper"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      InputLabelProps={{ shrink: true }}
                      helperText="A descriptive name for this role"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Property ID (Optional)"
                      placeholder="Leave blank for global role"
                      value={form.propertyId}
                      onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      helperText="Restrict role to a specific property"
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
                          {loading ? "Saving..." : editingId ? "Update Role" : "Create Role"}
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
            borderRadius: 4, 
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
                  <TableCell>Role Name</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((role, index) => (
                  <TableRow 
                    key={role.id} 
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(tokens.colors.primary.main, 0.08),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <RoleIcon sx={{ fontSize: 20, color: tokens.colors.primary.main }} />
                        </Box>
                        <Box>
                          <Button
                            component={Link}
                            href={`/admin/settings/rbac/roles/${role.id}`}
                            color="primary"
                            sx={{ 
                              textTransform: 'none', 
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              p: 0,
                              minWidth: 'auto',
                              '&:hover': {
                                bgcolor: 'transparent',
                                textDecoration: 'underline',
                              }
                            }}
                          >
                            {role.name}
                          </Button>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Click to configure permissions & menu access
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {role.propertyId ? (
                        <Chip 
                          label={role.propertyId} 
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : (
                        <Chip 
                          label="Global" 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(tokens.colors.success.main, 0.1),
                            color: tokens.colors.success.dark,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Configure Permissions">
                          <IconButton 
                            size="small"
                            component={Link}
                            href={`/admin/settings/rbac/roles/${role.id}`}
                            sx={{
                              bgcolor: alpha(tokens.colors.success.main, 0.08),
                              color: tokens.colors.success.main,
                              '&:hover': {
                                bgcolor: alpha(tokens.colors.success.main, 0.15),
                              }
                            }}
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Role">
                          <IconButton 
                            size="small" 
                            onClick={() => startEdit(role)}
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
                        </Tooltip>
                        <Tooltip title="Delete Role">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(role.id)}
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
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <RoleIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No roles found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Get started by creating your first role
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowForm(true)}
                          size="small"
                        >
                          Add Role
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {roles.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={roles.length}
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
