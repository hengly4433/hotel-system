"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { RbacSubmenu, RbacMenu } from "@/lib/types/rbac";
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
  ListAlt as SubmenuIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

export default function SubmenusPage() {
  const router = useRouter();
  const [submenus, setSubmenus] = useState<RbacSubmenu[]>([]);
  const [menus, setMenus] = useState<RbacMenu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [submenusData, menusData] = await Promise.all([
        apiJson<RbacSubmenu[]>("rbac/submenus"),
        apiJson<RbacMenu[]>("rbac/menus")
      ]);
      setSubmenus(submenusData);
      setMenus(menusData);
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

  const getMenuLabel = (menuId: string) => {
    const menu = menus.find(m => m.key === menuId);
    return menu?.label || menuId;
  };

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`rbac/submenus/${deleteId}`, { method: "DELETE" });
      showSuccess("Submenu deleted successfully");
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
        title="Submenus"
        subtitle="Navigation items under parent menus"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/settings/rbac/submenus/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Submenu
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
          }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ height: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60, bgcolor: 'background.paper' }}>No</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Parent Menu</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Key</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Label</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Route</TableCell>
                <TableCell sx={{ bgcolor: 'background.paper' }}>Sort Order</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'background.paper' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submenus
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
                    <Chip 
                      label={getMenuLabel(submenu.menuId)} 
                      size="small"
                      sx={{
                        fontWeight: 500,
                        bgcolor: alpha(tokens.colors.primary.main, 0.1),
                        color: tokens.colors.primary.dark,
                      }}
                    />
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
                        <SubmenuIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          bgcolor: tokens.colors.grey[100],
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {submenu.key}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {submenu.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      {submenu.route}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {submenu.sortOrder}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => router.push(`/admin/settings/rbac/submenus/${submenu.id}`)}
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
                          size="small"                            onClick={() => setDeleteId(submenu.id)}
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
              {submenus.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SubmenuIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No submenus found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get started by creating your first submenu
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push("/admin/settings/rbac/submenus/new")}
                        size="small"
                      >
                        Add Submenu
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
          count={submenus.length}
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
        title="Delete Submenu?"
        description="This action cannot be undone. The submenu will be permanently removed."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
