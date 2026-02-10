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
import { HousekeepingStatusItem } from "@/lib/api/reports";

interface HousekeepingStatusListTableProps {
  items: HousekeepingStatusItem[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HousekeepingStatusListTable({
  items,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: HousekeepingStatusListTableProps) {
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
              <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Room Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={row.roomId}
                  hover
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(tokens.colors.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {row.roomNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.roomType}</TableCell>
                  <TableCell>
                    {(() => {
                      const status = row.housekeepingStatus;
                      let color: "default" | "success" | "warning" | "error" | "info" =
                        "default";
                      let label = status;

                      switch (status) {
                        case "CLEAN":
                        case "DONE":
                          color = "success";
                          break;
                        case "PENDING":
                          color = "error";
                          label = "DIRTY"; // PENDING usually implies dirty/to-do
                          break;
                        case "IN_PROGRESS":
                          color = "warning";
                          label = "CLEANING";
                          break;
                        case "INSPECTED":
                          color = "info";
                          break;
                        default:
                          color = "default";
                      }
                      
                      return (
                        <Chip
                          label={label}
                          color={color}
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={row.assignedTo ? "text.primary" : "text.secondary"}
                    >
                      {row.assignedTo || "Unassigned"}
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
                  No housekeeping data found
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
