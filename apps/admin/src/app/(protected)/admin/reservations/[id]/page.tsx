"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Alert,
  Grid,
  Autocomplete,
  Chip
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

export default function ReservationDetailPage() {
  const params = useParams();
  const reservationId = params?.id as string | undefined;

  const [reservation, setReservation] = useState<any | null>(null);
  const [guestResults, setGuestResults] = useState<Array<{ id: string; firstName: string; lastName: string; email: string | null }>>([]);
  const [primaryGuest, setPrimaryGuest] = useState<{ id: string; firstName: string; lastName: string; email: string | null } | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadReservation() {
      if (!reservationId) return;
      setError(null);
      try {
        const data = await apiJson<any>(`reservations/${reservationId}`);
        setReservation(data);
        setAdults(data.adults || 0);
        setChildren(data.children || 0);
        setSpecialRequests(data.specialRequests || "");

        if (data.primaryGuestId) {
          const guest = await apiJson<any>(`guests/${data.primaryGuestId}`);
          setPrimaryGuest(guest);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    loadReservation();
  }, [reservationId]);

  async function searchGuests(query: string) {
    if (!query) {
      setGuestResults([]);
      return;
    }
    try {
      const data = await apiJson<Array<{ id: string; firstName: string; lastName: string; email: string | null }>>(
        `guests/search?q=${encodeURIComponent(query)}`
      );
      setGuestResults(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!reservationId) return;
    setError(null);
    setMessage(null);

    if (!primaryGuest) {
      setError("Select a primary guest.");
      return;
    }

    try {
      await apiJson(`reservations/${reservationId}`, {
        method: "PUT",
        body: JSON.stringify({
          primaryGuestId: primaryGuest.id,
          adults,
          children,
          specialRequests
        })
      });
      setMessage("Reservation updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main>
      <PageHeader title="Reservation Detail" subtitle={reservation?.code || ""} />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}

        {reservation && (
           <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="overline" color="text.secondary">Status</Typography>
                            <Box>
                                <Chip label={reservation.status} color="primary" />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                             <Typography variant="overline" color="text.secondary">Channel</Typography>
                             <Typography variant="body1" fontWeight="medium">{reservation.channel}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                             <Typography variant="overline" color="text.secondary">Dates</Typography>
                             <Typography variant="body1" fontWeight="medium">
                                {reservation.checkInDate} → {reservation.checkOutDate}
                             </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
           </Card>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Update Guest & Preferences
                </Typography>
                
                <Box component="form" onSubmit={handleSave} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                             <Autocomplete
                                options={guestResults}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName} ${option.email ? `(${option.email})` : ""}`}
                                value={primaryGuest}
                                onInputChange={(_, value) => searchGuests(value)}
                                onChange={(_, value) => setPrimaryGuest(value)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Primary Guest" 
                                        placeholder="Search guest by name/email" 
                                        required 
                                        fullWidth
                                    />
                                )}
                                noOptionsText="Type to search..."
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                type="number"
                                label="Adults"
                                value={adults}
                                onChange={(e) => setAdults(Number(e.target.value))}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                type="number"
                                label="Children"
                                value={children}
                                onChange={(e) => setChildren(Number(e.target.value))}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                multiline
                                rows={3}
                                label="Special Requests"
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                fullWidth
                            />
                        </Grid>

                         <Grid size={{ xs: 12 }}>
                             <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large"
                                    startIcon={<SaveIcon />}
                                >
                                    Save Changes
                                </Button>
                             </Box>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
      </Stack>
    </main>
  );
}
