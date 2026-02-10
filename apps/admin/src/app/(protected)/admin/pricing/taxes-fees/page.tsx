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
import TaxFeeForm from "./TaxFeeForm";
import TaxFeeListTable from "./TaxFeeListTable";

type Property = {
  id: string;
  name: string;
};

type TaxFee = {
  id: string;
  propertyId: string;
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  appliesTo: string;
  active: boolean;
};

export default function TaxesFeesPage() {
  const [taxesFees, setTaxesFees] = useState<TaxFee[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [editingItem, setEditingItem] = useState<TaxFee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [appliesToFilter, setAppliesToFilter] = useState("ALL");

  async function loadData() {
    setError(null);
    try {
      const [feesData, propertiesData] = await Promise.all([
        apiJson<TaxFee[]>("taxes-fees"),
        apiJson<Property[]>("properties")
      ]);
      setTaxesFees(feesData);
      setProperties(propertiesData);
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

  function startEdit(item: TaxFee) {
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
      type: data.type,
      value: Number(data.value),
      appliesTo: data.appliesTo,
      active: data.active
    };

    try {
      if (editingItem) {
        await apiJson(`taxes-fees/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("taxes-fees", {
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
      await apiJson(`taxes-fees/${deleteId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  }

  const filteredTaxesFees = useMemo(() => {
    return taxesFees.filter((item) => {
      // 1. Property Filter
      if (propertyFilter !== "ALL" && item.propertyId !== propertyFilter) {
        return false;
      }

      // 2. Type Filter
      if (typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== "ALL") {
        const isActive = statusFilter === "ACTIVE";
        if (item.active !== isActive) return false;
      }

      // 4. Applies To Filter
      if (appliesToFilter !== "ALL" && item.appliesTo !== appliesToFilter) {
         return false;
      }

      // 5. Search Query (Name)
      if (searchQuery) {
        if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [taxesFees, propertyFilter, typeFilter, statusFilter, appliesToFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setPropertyFilter("ALL");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setAppliesToFilter("ALL");
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
        title="Taxes & Fees" 
        subtitle="Manage tax and fee rules"
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
              New Tax/Fee
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
              <TaxFeeForm
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
                    sx={{ minWidth: 160, flex: 1 }}
                    fullWidth
                  >
                    <MenuItem value="ALL">All Properties</MenuItem>
                    {properties.map((prop) => (
                      <MenuItem key={prop.id} value={prop.id}>
                        {prop.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 120, flex: 1 }}
                    fullWidth
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="PERCENT">Percent</MenuItem>
                    <MenuItem value="FIXED">Fixed</MenuItem>
                  </TextField>
                  
                  <TextField
                     select
                     label="Applies To"
                     value={appliesToFilter}
                     onChange={(e) => setAppliesToFilter(e.target.value)}
                     size="small"
                     sx={{ minWidth: 140, flex: 1 }}
                     fullWidth
                  >
                     <MenuItem value="ALL">All Targets</MenuItem>
                     <MenuItem value="ROOM">Room</MenuItem>
                     <MenuItem value="SERVICE">Service</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 120, flex: 1 }}
                    fullWidth
                  >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </TextField>

                  <Tooltip title="Clear Filters">
                    <IconButton onClick={clearFilters} sx={{ bgcolor: tokens.colors.grey[100] }}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>

              <TaxFeeListTable
                items={filteredTaxesFees}
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
        title="Delete Tax/Fee?"
        description="This will permanently remove this tax or fee."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
