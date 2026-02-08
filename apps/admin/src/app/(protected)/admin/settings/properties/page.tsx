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
  Chip,
  TablePagination,
  Tooltip,
  alpha,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Business as PropertyIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Organization = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  organizationId: string;
  name: string;
  timezone: string | null;
  currency: string | null;
  city: string | null;
  country: string | null;
};

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [propsData, orgsData] = await Promise.all([
        apiJson<Property[]>("properties"),
        apiJson<Organization[]>("organizations")
      ]);
      setProperties(propsData);
      setOrganizations(orgsData);
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

  const getOrgName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || orgId;
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this property?")) return;
    try {
      await apiJson(`properties/${id}`, { method: "DELETE" });
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
        title="Properties"
        subtitle="Manage hotel properties"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/settings/properties/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Property
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
                  <TableCell>Property Name</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((property, index) => (
                  <TableRow 
                    key={property.id} 
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
                          <PropertyIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {property.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getOrgName(property.organizationId)} 
                        size="small"
                        sx={{
                          fontWeight: 500,
                          bgcolor: alpha(tokens.colors.primary.main, 0.1),
                          color: tokens.colors.primary.dark,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {property.city || property.country ? (
                        <Typography variant="body2" color="text.secondary">
                          {[property.city, property.country].filter(Boolean).join(', ')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {property.currency ? (
                        <Chip 
                          label={property.currency} 
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => router.push(`/admin/settings/properties/${property.id}`)}
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
                            onClick={() => handleDelete(property.id)}
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
                {properties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PropertyIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No properties found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Get started by creating your first property
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => router.push("/admin/settings/properties/new")}
                          size="small"
                        >
                          Add Property
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {properties.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={properties.length}
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
