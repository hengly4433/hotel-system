"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  TextField,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
  Alert,
  Stack,
  Fade,
  alpha,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CancellationPolicyForm from "./CancellationPolicyForm";
import CancellationPolicyListTable from "./CancellationPolicyListTable";

type Property = {
  id: string;
  name: string;
};

type CancellationPolicy = {
  id: string;
  propertyId: string;
  name: string;
  rules: string;
};

export default function CancellationPoliciesPage() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [editingItem, setEditingItem] = useState<CancellationPolicy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("ALL");

  async function loadData() {
    setError(null);
    try {
      const [policyData, propertyData] = await Promise.all([
        apiJson<CancellationPolicy[]>("cancellation-policies"),
        apiJson<Property[]>("properties")
      ]);
      setPolicies(policyData);
      setProperties(propertyData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getPropertyName = (id: string) => {
    const property = properties.find((p) => p.id === id);
    return property?.name || "Unknown";
  };

  function startEdit(item: CancellationPolicy) {
    setEditingItem(item);
    setShowForm(true);
  }

  function startAdd() {
    setEditingItem(null);
    setShowForm(true);
  }

  function resetForm() {
    setEditingItem(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(data: any) {
    setError(null);
    setIsSubmitting(true);

    const payload = {
      propertyId: data.propertyId,
      name: data.name,
      rules: data.rules
    };

    try {
      if (editingItem) {
        await apiJson(`cancellation-policies/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("cancellation-policies", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`cancellation-policies/${deleteId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  }

  const filteredPolicies = useMemo(() => {
    return policies.filter((item) => {
      // 1. Property Filter
      if (propertyFilter !== "ALL" && item.propertyId !== propertyFilter) {
        return false;
      }

      // 2. Search Query (Name)
      if (searchQuery) {
        if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [policies, propertyFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setPropertyFilter("ALL");
  };

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
        title="Cancellation Policies" 
        subtitle="Manage cancellation rules"
        action={
          !showForm ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={startAdd}
              sx={{
                boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
              }}
            >
              New Policy
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

        {showForm ? (
          <Fade in={showForm}>
            <Box>
              <CancellationPolicyForm
                initialData={editingItem}
                properties={properties}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                isSubmitting={isSubmitting}
              />
            </Box>
          </Fade>
        ) : (
          <Fade in={!showForm}>
            <Box>
              {/* Filters Toolbar */}
              <Card
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: "18px",
                  boxShadow: tokens.shadows.card,
                  border: `1px solid ${tokens.colors.grey[200]}`,
                }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                  <TextField
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ flex: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    select
                    label="Property"
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200, flex: 1 }}
                    fullWidth
                  >
                    <MenuItem value="ALL">All Properties</MenuItem>
                    {properties.map((prop) => (
                      <MenuItem key={prop.id} value={prop.id}>
                        {prop.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Tooltip title="Clear Filters">
                    <IconButton onClick={clearFilters} sx={{ bgcolor: tokens.colors.grey[100] }}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>

              <CancellationPolicyListTable
                items={filteredPolicies}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                onEdit={startEdit}
                onDelete={setDeleteId}
                getPropertyName={getPropertyName}
                onAddClick={startAdd}
              />
            </Box>
          </Fade>
        )}
      </Stack>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Cancellation Policy?"
        description="This will permanently remove this cancellation policy."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
