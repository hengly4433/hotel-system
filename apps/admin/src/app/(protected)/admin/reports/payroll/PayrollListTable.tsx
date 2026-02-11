"use client";

import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  alpha,
  Typography,
  Chip,
} from "@mui/material";
import { tokens } from "@/lib/theme";
import { PayrollReportItem } from "@/lib/api/reports";

interface PayrollListTableProps {
  items: PayrollReportItem[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PayrollListTable({
  items,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PayrollListTableProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Job Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Hourly Rate</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Hours</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Pay</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={row.employeeId}
                  hover
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(tokens.colors.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.employeeName}</TableCell>
                  <TableCell>{row.jobTitle || "-"}</TableCell>
                  <TableCell>
                    {row.department && (
                      <Chip label={row.department} size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(row.hourlyRate)}</TableCell>
                  <TableCell>{formatHours(row.totalMinutes)}</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "success.main" }}>
                    {formatCurrency(row.totalPay)}
                  </TableCell>
                </TableRow>
              ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  No payroll data found for this period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={items.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
