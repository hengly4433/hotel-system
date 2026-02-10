"use client";

import { useState, useCallback, useEffect } from "react";
import { Stack, Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import { format } from "date-fns";
import { reportsApi, GuestInHouseItem } from "@/lib/api/reports";
import { tokens } from "@/lib/theme";
import GuestListTable from "./GuestListTable";

export default function GuestsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [data, setData] = useState<GuestInHouseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    if (!date) return;
    
    setLoading(true);
    try {
      const result = await reportsApi.getGuestsInHouse(date);
      setData(result);
      setPage(0);
    } catch (err) {
      console.error("Failed to fetch guests in house report", err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box component="main">
      <PageHeader title="Guests In-House" subtitle="Current guest list" />
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
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            size="small"
                        />
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
            <GuestListTable
                items={data}
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
