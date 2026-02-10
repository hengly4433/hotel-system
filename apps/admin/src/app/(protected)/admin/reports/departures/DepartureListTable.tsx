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
import { GuestInHouseItem } from "@/lib/api/reports";
import { format } from "date-fns";

interface DepartureListTableProps {
  items: GuestInHouseItem[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DepartureListTable({
  items,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: DepartureListTableProps) {
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
              <TableCell sx={{ fontWeight: "bold" }}>Guest Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Check In</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Check Out</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={row.reservationId || `${row.roomNumber}-${row.guestName}`}
                  hover
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(tokens.colors.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {row.guestName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {row.roomNumber || "TBD"}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.checkInDate}</TableCell>
                  <TableCell>{row.checkOutDate}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha(tokens.colors.success.main, 0.1),
                        color: tokens.colors.success.dark,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {row.status.replace("_", " ")}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  No departures found
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
