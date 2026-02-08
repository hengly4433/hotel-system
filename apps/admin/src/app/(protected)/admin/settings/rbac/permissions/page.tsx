"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacPermission } from "@/lib/types/rbac";
import {
  Box,
  Button,
  Card,
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
  Chip,
  TablePagination,
  Tooltip,
  alpha,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Security as SecurityIcon,
  Key as KeyIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export default function PermissionsPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const data = await apiJson<RbacPermission[]>("rbac/permissions");
      setPermissions(data);
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

  async function handleDelete(permissionId: string) {
    if (!confirm("Delete this permission?")) return;
    try {
      await apiJson(`rbac/permissions/${permissionId}`, { method: "DELETE" });
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

  const getActionColor = (action: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      CREATE: { bg: alpha(tokens.colors.success.main, 0.1), color: tokens.colors.success.dark },
      READ: { bg: alpha(tokens.colors.primary.main, 0.1), color: tokens.colors.primary.dark },
      UPDATE: { bg: alpha(tokens.colors.warning.main, 0.1), color: tokens.colors.warning.dark },
      DELETE: { bg: alpha(tokens.colors.error.main, 0.1), color: tokens.colors.error.dark },
    };
    return colors[action.toUpperCase()] || { bg: alpha(tokens.colors.grey[500], 0.1), color: tokens.colors.grey[700] };
  };

  return (
    <Box component="main">
      <PageHeader
        title="Permissions"
        subtitle="Granular access rules for your system"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/settings/rbac/permissions/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Permission
          </Button>
        }
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Table Card */}
        <Card 
          sx={{ 
            borderRadius: '18px', 
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
                  <TableCell>Resource</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Permission Key</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((permission, index) => {
                    const actionColor = getActionColor(permission.action);
                    const permissionKey = `${permission.resource}.${permission.action}${permission.scope ? '.' + permission.scope : ''}`;
                    return (
                      <TableRow 
                        key={permission.id} 
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <SecurityIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {permission.resource}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={permission.action} 
                            size="small"
                            sx={{
                              fontWeight: 600,
                              bgcolor: actionColor.bg,
                              color: actionColor.color,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {permission.scope ? (
                            <Chip 
                              label={permission.scope} 
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              bgcolor: tokens.colors.grey[100],
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                            }}
                          >
                            {permissionKey}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                onClick={() => router.push(`/admin/settings/rbac/permissions/${permission.id}`)}
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
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(permission.id)}
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
                    );
                  })}
                {permissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <KeyIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No permissions found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Get started by creating your first permission
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => router.push("/admin/settings/rbac/permissions/new")}
                          size="small"
                        >
                          Add Permission
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {permissions.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={permissions.length}
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
