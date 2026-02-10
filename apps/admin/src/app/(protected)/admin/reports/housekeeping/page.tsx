"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Stack, Box, Card, CardContent, Grid, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import { reportsApi, HousekeepingStatusItem } from "@/lib/api/reports";
import { tokens } from "@/lib/theme";
import HousekeepingStatusListTable from "./HousekeepingStatusListTable";

export default function HousekeepingPage() {
  const [data, setData] = useState<HousekeepingStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assignedFilter, setAssignedFilter] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await reportsApi.getHousekeeping();
      setData(result);
      setPage(0);
    } catch (err) {
      console.error("Failed to fetch housekeeping status", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.roomNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || item.housekeepingStatus === statusFilter;
      const matchesAssigned = assignedFilter === "ALL" 
        ? true 
        : assignedFilter === "ASSIGNED" 
          ? item.assignedTo && item.assignedTo !== "Unassigned"
          : !item.assignedTo || item.assignedTo === "Unassigned";

      return matchesSearch && matchesStatus && matchesAssigned;
    });
  }, [data, search, statusFilter, assignedFilter]);

  return (
    <Box component="main">
      <PageHeader title="Housekeeping Status" subtitle="Room cleaning status" />
      <Stack spacing={3}>
        {/* Filters */}
        <Card
            sx={{
            borderRadius: "18px",
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Filter Data
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            label="Search Room"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Room Number..."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Statuses</MenuItem>
                                <MenuItem value="CLEAN">Clean</MenuItem>
                                <MenuItem value="PENDING">Dirty (Pending)</MenuItem>
                                <MenuItem value="IN_PROGRESS">Cleaning (In Progress)</MenuItem>
                                <MenuItem value="INSPECTED">Inspected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Assignment</InputLabel>
                            <Select
                                value={assignedFilter}
                                label="Assignment"
                                onChange={(e) => setAssignedFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                                <MenuItem value="UNASSIGNED">Unassigned</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        {/* List Table */}
        <Card
            sx={{
            borderRadius: "18px",
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
            }}
        >
            <HousekeepingStatusListTable
                items={filteredData}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />
        </Card>
      </Stack>
    </Box>
  );
}
