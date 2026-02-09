"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacRole } from "@/lib/types/rbac";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  TablePagination,
  Tooltip,
  alpha,
  Chip,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  AdminPanelSettings as RoleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

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

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`rbac/roles/${deleteId}`, { method: "DELETE" });
      showSuccess("Role deleted successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/settings/rbac/roles/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Role
          </Button>
        }
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
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

        {/* Table Card */}
        <Card 
          sx={{ 
            borderRadius: '18px', 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ height: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60, bgcolor: 'background.paper' }}>No</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Role Name</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Property</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'background.paper' }}>Actions</TableCell>
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
                          onClick={() => router.push(`/admin/settings/rbac/roles/${role.id}/edit`)}
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
                          onClick={() => setDeleteId(role.id)}
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
                        onClick={() => router.push("/admin/settings/rbac/roles/new")}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={roles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${tokens.colors.grey[200]}`,
            backgroundColor: tokens.colors.grey[50],
            flexShrink: 0,
            minHeight: 52,
            zIndex: 1,
          }}
        />
      </Card>
      </Stack>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Role?"
        description="This action cannot be undone. The role will be permanently removed."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
