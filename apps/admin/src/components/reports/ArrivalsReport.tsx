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
  TablePagination
} from "@mui/material";
import { format } from "date-fns";
import { reportsApi, GuestInHouseItem } from "@/lib/api/reports";

interface Props {
  date: Date | null;
}

export default function ArrivalsReport({ date }: Props) {
  const [data, setData] = useState<GuestInHouseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await reportsApi.getArrivals(date ? format(date, "yyyy-MM-dd") : undefined);
        if (active) {
          setData(result);
          setPage(0);
        }
      } catch (err) {
        console.error("Failed to fetch arrivals", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [date]);

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
                <TableCell sx={{ fontWeight: "bold" }}>Guest Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Check In</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Check Out</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={row.reservationId || `${row.roomNumber}-${row.guestName}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.guestName}</TableCell>
                    <TableCell>{row.roomNumber}</TableCell>
                    <TableCell>{row.checkInDate}</TableCell>
                    <TableCell>{row.checkOutDate}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No arrivals found
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
