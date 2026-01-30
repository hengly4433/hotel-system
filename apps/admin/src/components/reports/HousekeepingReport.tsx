"use client";

import { useEffect, useState } from "react";
import { 
  Box, 
  CircularProgress, 
  Card, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip
} from "@mui/material";
import { reportsApi, HousekeepingStatusItem } from "@/lib/api/reports";

export default function HousekeepingReport() {
  const [data, setData] = useState<HousekeepingStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await reportsApi.getHousekeeping();
        if (active) {
          setData(result);
          setPage(0);
        }
      } catch (err) {
        console.error("Failed to fetch housekeeping status", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <CircularProgress />;

  return (
    <Card sx={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderRadius: 3 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Room Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={row.roomId} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.roomNumber}</TableCell>
                    <TableCell>{row.roomType}</TableCell>
                    <TableCell>
                      {(() => {
                        const status = row.housekeepingStatus;
                        let color: "default" | "success" | "warning" | "error" = "default";
                        if (status === "CLEAN") color = "success";
                        if (status === "DIRTY") color = "error";
                        if (status === "CLEANING") color = "warning";
                        return <Chip label={status} color={color} size="small" />;
                      })()}
                    </TableCell>
                    <TableCell>{row.assignedTo || "-"}</TableCell>
                  </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No housekeeping data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Card>
  );
}
