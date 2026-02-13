"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  Stack, 
  Alert,
  IconButton,
  Grid,
  Autocomplete,
  alpha,
  Divider,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Save as SaveIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  MeetingRoom as RoomIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { tokens } from "@/lib/theme";

type Property = { id: string; name: string };
type RoomType = { id: string; name: string; propertyId: string };
type Room = { id: string; roomNumber: string; propertyId: string; roomTypeId: string };
type RatePlan = { id: string; propertyId: string; code: string; name: string };
type Guest = { id: string; firstName: string; lastName: string; email: string | null };

const EMPTY_ROOM = {
  roomTypeId: "",
  roomId: "",
  ratePlanId: "",
  guestsInRoom: "1"
};

export default function NewReservationPage() {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState("");
  const [primaryGuestId, setPrimaryGuestId] = useState("");
  const [guestResults, setGuestResults] = useState<Guest[]>([]);
  
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [rooms, setRooms] = useState([{ ...EMPTY_ROOM }]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const selectedProperty = properties.find(p => p.id === propertyId) || null;
  const visibleRatePlans = propertyId
    ? ratePlans.filter((plan) => plan.propertyId === propertyId)
    : ratePlans;
  const visibleRoomTypes = propertyId
    ? roomTypes.filter((type) => type.propertyId === propertyId)
    : roomTypes;
  const visibleRooms = propertyId
    ? roomList.filter((r) => r.propertyId === propertyId)
    : roomList;

  useEffect(() => {
    async function loadLookups() {
      try {
        const [types, roomsData, propertiesData, ratePlansData] = await Promise.all([
          apiJson<RoomType[]>("room-types"),
          apiJson<Room[]>("rooms"),
          apiJson<Property[]>("properties"),
          apiJson<RatePlan[]>("rate-plans")
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
    try {
      const endpoint = query
        ? `guests/search?q=${encodeURIComponent(query)}`
        : "guests";
      const data = await apiJson<Guest[]>(endpoint);
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
    if (!checkInDate || !checkOutDate) {
      setError("Select check-in and check-out dates.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiJson("reservations", {
        method: "POST",
        body: JSON.stringify({
          propertyId,
          primaryGuestId,
          checkInDate: format(checkInDate, "yyyy-MM-dd"),
          checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
          adults: Number(adults) || 0,
          children: Number(children) || 0,
          rooms: rooms.map((room) => ({
            roomTypeId: room.roomTypeId,
            roomId: room.roomId || null,
            ratePlanId: room.ratePlanId,
            guestsInRoom: Number(room.guestsInRoom) || 1
          }))
        })
      });
      setMessage("Reservation created successfully!");
      // Redirect to reservation list after short delay
      setTimeout(() => {
        router.push("/admin/reservations");
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  const nightCount = checkInDate && checkOutDate 
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Box component="main">
      <PageHeader title="New Reservation" subtitle="Create a new booking" />
      
      <Stack spacing={3} sx={{ mt: 3, pb: 20 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" onClose={() => setMessage(null)}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Trip Details - Full Width */}
            <Grid size={{ xs: 12 }}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: tokens.shadows.card,
                  border: `1px solid ${tokens.colors.grey[200]}`,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Section Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: alpha(tokens.colors.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HotelIcon sx={{ color: tokens.colors.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Trip Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Basic booking information
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={3}>
                    {/* Property & Primary Guest - Two Columns */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          id="property-autocomplete"
                          options={properties}
                          getOptionLabel={(option) => option.name}
                          value={selectedProperty}
                          onChange={(_, value) => {
                            setPropertyId(value?.id || "");
                            // Reset room selections when property changes
                            setRooms([{ ...EMPTY_ROOM }]);
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Property" 
                              placeholder="Search property..." 
                              required={!propertyId}
                              InputLabelProps={{ shrink: true }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          )}
                          noOptionsText="No properties found"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          id="primary-guest-autocomplete"
                          options={guestResults}
                          getOptionLabel={(option) => `${option.firstName} ${option.lastName} ${option.email ? `(${option.email})` : ""}`}
                          isOptionEqualToValue={(opt, val) => opt.id === val.id}
                          onOpen={() => searchGuests("")}
                          onInputChange={(_, value) => searchGuests(value)}
                          onChange={(_, value) => setPrimaryGuestId(value?.id || "")}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Primary Guest" 
                              placeholder="Search by name or email..." 
                              required={!primaryGuestId}
                              InputLabelProps={{ shrink: true }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <PersonIcon sx={{ color: tokens.colors.grey[400], mr: 1, fontSize: 20 }} />
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          noOptionsText="Type to search..."
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarIcon sx={{ color: tokens.colors.grey[500], fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          Stay Dates
                        </Typography>
                        {nightCount > 0 && (
                          <Box
                            sx={{
                              ml: 'auto',
                              px: 1.5,
                              py: 0.25,
                              borderRadius: 2,
                              bgcolor: alpha(tokens.colors.primary.main, 0.1),
                              color: tokens.colors.primary.main,
                            }}
                          >
                            <Typography variant="caption" fontWeight={600}>
                              {nightCount} night{nightCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <DatePicker
                            label="Check-in"
                            value={checkInDate}
                            onChange={(newValue) => setCheckInDate(newValue)}
                            slotProps={{ 
                              textField: { 
                                id: "check-in-date",
                                fullWidth: true, 
                                required: true,
                                size: "small",
                                InputLabelProps: { shrink: true },
                                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                              } 
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <DatePicker
                            label="Check-out"
                            value={checkOutDate}
                            onChange={(newValue) => setCheckOutDate(newValue)}
                            slotProps={{ 
                              textField: { 
                                id: "check-out-date",
                                fullWidth: true, 
                                required: true,
                                size: "small",
                                InputLabelProps: { shrink: true },
                                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                              } 
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PeopleIcon sx={{ color: tokens.colors.grey[500], fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          Guests
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            id="adults-count"
                            label="Adults"
                            value={adults}
                            onChange={(e) => setAdults(e.target.value.replace(/[^0-9]/g, ''))}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            id="children-count"
                            label="Children"
                            value={children}
                            onChange={(e) => setChildren(e.target.value.replace(/[^0-9]/g, ''))}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Room Selection - Full Width */}
            <Grid size={{ xs: 12 }}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: tokens.shadows.card,
                  border: `1px solid ${tokens.colors.grey[200]}`,
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: alpha(tokens.colors.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <RoomIcon sx={{ color: tokens.colors.primary.main }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Room Selection
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rooms.length} room{rooms.length !== 1 ? 's' : ''} selected
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      onClick={addRoom} 
                      size="small"
                    >
                      Add Room
                    </Button>
                  </Stack>

                  <Stack spacing={3}>
                    {rooms.map((room, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 2,
                          bgcolor: tokens.colors.grey[50],
                          border: `1px solid ${tokens.colors.grey[200]}`,
                        }}
                      >
                        <Stack spacing={3}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 2,
                                  bgcolor: tokens.colors.primary.main,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                }}
                              >
                                {index + 1}
                              </Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Room {index + 1}
                              </Typography>
                            </Box>
                            {rooms.length > 1 && (
                              <IconButton 
                                onClick={() => removeRoom(index)} 
                                size="small"
                                sx={{
                                  bgcolor: alpha(tokens.colors.error.main, 0.08),
                                  color: tokens.colors.error.main,
                                  '&:hover': {
                                    bgcolor: alpha(tokens.colors.error.main, 0.15),
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                          
                          <Grid container spacing={2}>
                            {/* Room Type - Searchable */}
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Autocomplete
                                id={`room-type-autocomplete-${index}`}
                                options={visibleRoomTypes}
                                getOptionLabel={(option) => option.name}
                                value={visibleRoomTypes.find(t => t.id === room.roomTypeId) || null}
                                onChange={(_, value) => updateRoom(index, { roomTypeId: value?.id || "", roomId: "" })}
                                size="small"
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    label="Room Type" 
                                    placeholder="Search type..."
                                    required={!room.roomTypeId}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                                noOptionsText="No types found"
                              />
                            </Grid>

                            {/* Room Number - Searchable */}
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Autocomplete
                                id={`room-number-autocomplete-${index}`}
                                options={visibleRooms.filter(r => !room.roomTypeId || r.roomTypeId === room.roomTypeId)}
                                getOptionLabel={(option) => option.roomNumber}
                                value={visibleRooms.find(r => r.id === room.roomId) || null}
                                onChange={(_, value) => updateRoom(index, { roomId: value?.id || "" })}
                                size="small"
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    label="Room Number" 
                                    placeholder="Search room..."
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                                noOptionsText="No rooms found"
                              />
                            </Grid>

                            {/* Rate Plan - Searchable */}
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Autocomplete
                                id={`rate-plan-autocomplete-${index}`}
                                options={visibleRatePlans}
                                getOptionKey={(option) => option.id}
                                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                value={visibleRatePlans.find(p => p.id === room.ratePlanId) || null}
                                onChange={(_, value) => updateRoom(index, { ratePlanId: value?.id || "" })}
                                size="small"
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    label="Rate Plan" 
                                    placeholder="Search plan..."
                                    required={!room.ratePlanId}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                                noOptionsText="No rate plans"
                              />
                            </Grid>

                            {/* Guests - Text input */}
                            <Grid size={{ xs: 12, md: 2 }}>
                              <TextField
                                id={`guests-in-room-${index}`}
                                label="Guests"
                                value={room.guestsInRoom}
                                onChange={(e) => updateRoom(index, { guestsInRoom: e.target.value.replace(/[^0-9]/g, '') })}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          </Grid>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Box
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  right: 0,
                  width: { xs: '100%', md: 'calc(100% - 260px)' }, // Match AppShell layout
                  px: 3,
                  pt: 2,
                  pb: 2,
                  bgcolor: 'background.paper',
                  borderTop: `1px solid ${tokens.colors.grey[200]}`,
                  zIndex: 20,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="medium"
                  disabled={isSubmitting}
                  onClick={() => router.push("/admin/reservations")}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    borderColor: tokens.colors.grey[300],
                    color: tokens.colors.grey[700],
                    '&:hover': {
                      borderColor: tokens.colors.grey[400],
                      bgcolor: tokens.colors.grey[50],
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="medium"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1,
                    borderRadius: 2,
                    boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.3)}`,
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Reservation'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}
