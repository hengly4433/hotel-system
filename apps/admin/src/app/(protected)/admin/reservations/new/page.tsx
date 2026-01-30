"use client";

import { useEffect, useState } from "react";
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
  IconButton,
  Grid,
  Paper,
  Autocomplete
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";

const EMPTY_ROOM = {
  roomTypeId: "",
  roomId: "",
  ratePlanId: "",
  guestsInRoom: 1
};

export default function NewReservationPage() {
  const [propertyId, setPropertyId] = useState("");
  const [primaryGuestId, setPrimaryGuestId] = useState("");
  const [guestResults, setGuestResults] = useState<Array<{ id: string; firstName: string; lastName: string; email: string | null }>>([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState([EMPTY_ROOM]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [roomTypes, setRoomTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [roomList, setRoomList] = useState<Array<{ id: string; roomNumber: string }>>([]);
  const [ratePlans, setRatePlans] = useState<Array<{ id: string; propertyId: string; code: string; name: string }>>([]);
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);

  const visibleRatePlans = propertyId
    ? ratePlans.filter((plan) => plan.propertyId === propertyId)
    : ratePlans;

  useEffect(() => {
    async function loadLookups() {
      try {
        const [types, roomsData, propertiesData, ratePlansData] = await Promise.all([
          apiJson<Array<{ id: string; name: string }>>("room-types"),
          apiJson<Array<{ id: string; roomNumber: string }>>("rooms"),
          apiJson<Array<{ id: string; name: string }>>("properties"),
          apiJson<Array<{ id: string; propertyId: string; code: string; name: string }>>("rate-plans")
        ]);
        setRoomTypes(types);
        setRoomList(roomsData);
        setProperties(propertiesData);
        setRatePlans(ratePlansData);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    loadLookups();
  }, []);

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

  function updateRoom(index: number, patch: Partial<typeof EMPTY_ROOM>) {
    setRooms((prev) => prev.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  }

  function addRoom() {
    setRooms((prev) => [...prev, { ...EMPTY_ROOM }]);
  }

  function removeRoom(index: number) {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!primaryGuestId) {
      setError("Select a primary guest.");
      return;
    }

    try {
      await apiJson("reservations", {
        method: "POST",
        body: JSON.stringify({
          propertyId,
          primaryGuestId,
          checkInDate,
          checkOutDate,
          adults,
          children,
          rooms: rooms.map((room) => ({
            roomTypeId: room.roomTypeId,
            roomId: room.roomId || null,
            ratePlanId: room.ratePlanId,
            guestsInRoom: room.guestsInRoom
          }))
        })
      });
      setMessage("Reservation created.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main>
      <PageHeader title="New Reservation" subtitle="Create a booking" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, height: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Trip Details
                  </Typography>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                      select
                      label="Property"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      required
                      fullWidth
                    >
                      <MenuItem value="">Select</MenuItem>
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Autocomplete
                        options={guestResults}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName} ${option.email ? `(${option.email})` : ""}`}
                        onInputChange={(_, value) => searchGuests(value)}
                        onChange={(_, value) => setPrimaryGuestId(value?.id || "")}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Primary Guest" 
                                placeholder="Search guest by name/email" 
                                required={!primaryGuestId}
                            />
                        )}
                        noOptionsText="Type to search..."
                    />

                    <Stack direction="row" spacing={2}>
                        <TextField
                        type="date"
                        label="Check-in"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                        type="date"
                        label="Check-out"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <TextField
                        type="number"
                        label="Adults"
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        fullWidth
                        />
                        <TextField
                        type="number"
                        label="Children"
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        fullWidth
                        />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Rooms
                    </Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addRoom} size="small">
                      Add Room
                    </Button>
                  </Stack>

                  <Stack spacing={2}>
                    {rooms.map((room, index) => (
                      <Paper 
                        key={index} 
                        variant="outlined" 
                        sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                        }}
                      >
                        <Stack spacing={3}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Room #{index + 1}
                                </Typography>
                                {rooms.length > 1 && (
                                    <IconButton onClick={() => removeRoom(index)} color="error" size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Stack>
                            <Grid container spacing={2}>
                             <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    select
                                    label="Room Type"
                                    value={room.roomTypeId}
                                    onChange={(e) => updateRoom(index, { roomTypeId: e.target.value })}
                                    required
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    {roomTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                    ))}
                                </TextField>
                             </Grid>
                             <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    select
                                    label="Room (Optional)"
                                    value={room.roomId}
                                    onChange={(e) => updateRoom(index, { roomId: e.target.value })}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {roomList.map((roomItem) => (
                                    <MenuItem key={roomItem.id} value={roomItem.id}>
                                        {roomItem.roomNumber}
                                    </MenuItem>
                                    ))}
                                </TextField>
                             </Grid>
                             <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    select
                                    label="Rate Plan"
                                    value={room.ratePlanId}
                                    onChange={(e) => updateRoom(index, { ratePlanId: e.target.value })}
                                    required
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    {visibleRatePlans.map((plan) => (
                                    <MenuItem key={plan.id} value={plan.id}>
                                        {plan.code} — {plan.name}
                                    </MenuItem>
                                    ))}
                                </TextField>
                             </Grid>
                             <Grid size={{ xs: 12, md: 2 }}>
                                <TextField
                                    type="number"
                                    label="Guests"
                                    value={room.guestsInRoom}
                                    onChange={(e) => updateRoom(index, { guestsInRoom: Number(e.target.value) })}
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                    size="small"
                                />
                             </Grid>
                           </Grid>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ mt: 3, textAlign: 'right' }}>
                 <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    startIcon={<SaveIcon />}
                    sx={{ px: 4 }}
                 >
                    Create Reservation
                 </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </main>
  );
}
