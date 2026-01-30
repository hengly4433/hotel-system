"use client";

import { Box, Card, CardContent, TextField, Stack, Typography } from "@mui/material";

interface Props {
  fromDate: string;
  toDate?: string;
  onFromDateChange: (date: string) => void;
  onToDateChange?: (date: string) => void;
  hideEndDate?: boolean;
}

export default function ReportFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  hideEndDate
}: Props) {
  return (
    <Card sx={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Filter Data
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
          <TextField
            label={hideEndDate ? "Date" : "From Date"}
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ maxWidth: 300 }}
          />
          {!hideEndDate && toDate && onToDateChange && (
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ maxWidth: 300 }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
