"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
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
  TablePagination,
  Tooltip,
  alpha,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Business as OrgIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";

type Organization = {
  id: string;
  name: string;
};

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const data = await apiJson<Organization[]>("organizations");
      setOrganizations(data);
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
      await apiJson(`organizations/${deleteId}`, { method: "DELETE" });
      showSuccess("Organization deleted successfully");
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
        title="Organizations"
        subtitle="Manage hotel groups and chains"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/settings/organizations/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Organization
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
                <TableCell sx={{ bgcolor: 'background.paper' }}>Organization Name</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'background.paper' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((org, index) => (
                <TableRow 
                  key={org.id} 
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
                        <OrgIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {org.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => router.push(`/admin/settings/organizations/${org.id}`)}
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
                          onClick={() => setDeleteId(org.id)}
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
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <OrgIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No organizations found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get started by creating your first organization
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push("/admin/settings/organizations/new")}
                        size="small"
                      >
                        Add Organization
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
          count={organizations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${tokens.colors.grey[200]}`,
            backgroundColor: tokens.colors.grey[50],
          }}
        />
      </Card>
      </Stack>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Organization?"
        description="This will permanently remove this organization."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
