"use client";

import { useState, useCallback, useEffect } from "react";
import { Stack, Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { reportsApi, RevenueReportItem } from "@/lib/api/reports";
import { tokens } from "@/lib/theme";
import RevenueListTable from "./RevenueListTable";

export default function RevenuePage() {
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  
  const [data, setData] = useState<RevenueReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    if (!fromDate || !toDate) return;
    
    setLoading(true);
    try {
      const result = await reportsApi.getRevenue({
        fromDate,
        toDate,
      });
      setData(result);
      setPage(0);
    } catch (err) {
      console.error("Failed to fetch revenue report", err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box component="main">
      <PageHeader title="Revenue Report" subtitle="Financial performance over time" />
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
                            label="From Date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            label="To Date"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
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
            <RevenueListTable
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
