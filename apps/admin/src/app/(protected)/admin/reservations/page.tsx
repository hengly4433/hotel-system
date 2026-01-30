"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
} from "@mui/icons-material";

type Reservation = {
  id: string;
  code: string;
  status: string;
  channel: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  rooms: Array<{
    id: string;
    roomTypeId: string;
    roomId?: string | null;
    ratePlanId: string;
    guestsInRoom: number;
  }>;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Reservation[]>("reservations");
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function handleCheckIn(id: string) {
    try {
      await apiJson(`reservations/${id}/checkin`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCheckOut(id: string) {
    try {
      await apiJson(`reservations/${id}/checkout`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await apiJson(`reservations/${id}/cancel`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "CONFIRMED":
        return "success";
      case "CHECKED_IN":
        return "info";
      case "CHECKED_OUT":
        return "default";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  }

  return (
    <Box>
      <PageHeader
        title="Reservations"
        subtitle="View and manage bookings"
        action={
          <Button
            variant="contained"
            component={Link}
            href="/admin/reservations/new"
            startIcon={<EventIcon />}
          >
            New Reservation
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Rooms</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No reservations found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {res.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={res.status}
                        size="small"
                        color={getStatusColor(res.status) as any}
                        variant={res.status === "CANCELLED" ? "outlined" : "filled"}
                        sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {res.checkInDate} → {res.checkOutDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {res.adults} Ad, {res.children} Ch
                    </TableCell>
                    <TableCell>{res.rooms.length}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          component={Link}
                          href={`/admin/reservations/${res.id}`}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {res.status !== "CANCELLED" && res.status !== "CHECKED_OUT" && (
                        <>
                          {res.status !== "CHECKED_IN" && (
                            <Tooltip title="Check In">
                              <IconButton
                                onClick={() => handleCheckIn(res.id)}
                                size="small"
                                color="info"
                              >
                                <CheckInIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {res.status === "CHECKED_IN" && (
                            <Tooltip title="Check Out">
                              <IconButton
                                onClick={() => handleCheckOut(res.id)}
                                size="small"
                                color="success"
                              >
                                <CheckOutIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Cancel">
                            <IconButton
                              onClick={() => handleCancel(res.id)}
                              size="small"
                              color="error"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
