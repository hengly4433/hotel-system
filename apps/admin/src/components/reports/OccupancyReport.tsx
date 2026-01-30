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
import { reportsApi, OccupancyReportItem } from "@/lib/api/reports";

interface Props {
  fromDate: Date | null;
  toDate: Date | null;
}

export default function OccupancyReport({ fromDate, toDate }: Props) {
  const [data, setData] = useState<OccupancyReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!fromDate || !toDate) return;

    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await reportsApi.getOccupancy({
          fromDate: format(fromDate, "yyyy-MM-dd"),
          toDate: format(toDate, "yyyy-MM-dd"),
        });
        if (active) {
          setData(result);
          setPage(0);
        }
      } catch (err) {
        console.error("Failed to fetch occupancy", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [fromDate, toDate]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <CircularProgress />;
  if (!fromDate || !toDate) return null;

  return (
    <Card sx={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderRadius: 3 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total Rooms</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Occupied Rooms</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Occupancy %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={row.date} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.totalRooms}</TableCell>
                    <TableCell>{row.occupiedRooms}</TableCell>
                    <TableCell>
                      {row.occupancyPercentage ? `${row.occupancyPercentage.toFixed(2)}%` : "0%"}
                    </TableCell>
                  </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No data found
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
