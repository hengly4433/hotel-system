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
} from "@mui/material";
import { tokens } from "@/lib/theme";
import { OccupancyReportItem } from "@/lib/api/reports";

interface OccupancyListTableProps {
  items: OccupancyReportItem[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function OccupancyListTable({
  items,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: OccupancyListTableProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Rooms</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Occupied Rooms</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Occupancy %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={row.date}
                  hover
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(tokens.colors.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.totalRooms}</TableCell>
                  <TableCell>{row.occupiedRooms}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color:
                          row.occupancyPercentage >= 80
                            ? "success.main"
                            : row.occupancyPercentage >= 50
                            ? "warning.main"
                            : "text.primary",
                      }}
                    >
                      {row.occupancyPercentage ? `${row.occupancyPercentage.toFixed(2)}%` : "0%"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  No occupancy data found for this period
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
