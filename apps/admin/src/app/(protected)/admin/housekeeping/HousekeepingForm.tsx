"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Grid,
  List,
  ListItem,
  alpha,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { 
  CleaningServices as HousekeepingIcon,
  Business as PropertyIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Property = {
  id: string;
  name: string;
};

type Room = {
  id: string;
  roomNumber: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

type StatusEvent = {
  status: string;
  changedAt: string;
  changedByUserId: string | null;
};

export type HousekeepingFormData = {
  propertyId: string;
  roomId: string;
  taskDate: string;
  shift: string;
  status: string;
  assignedToEmployeeId: string;
  checklist: string;
};

const SHIFTS = ["AM", "PM", "NIGHT"] as const;
const STATUSES = ["PENDING", "IN_PROGRESS", "DONE", "INSPECTED"] as const;

const EMPTY_FORM: HousekeepingFormData = {
  propertyId: "",
  roomId: "",
  taskDate: new Date().toISOString().split('T')[0],
  shift: "AM",
  status: "PENDING",
  assignedToEmployeeId: "",
  checklist: "{}",
};

type HousekeepingFormProps = {
  initialData?: HousekeepingFormData | null;
  properties: Property[];
  rooms: Room[];
  employees: Employee[];
  events?: StatusEvent[]; // Keep this optional for create mode
  onSubmit: (data: HousekeepingFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
};

export default function HousekeepingForm({
  initialData,
  properties,
  rooms,
  employees,
  events = [],
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
}: HousekeepingFormProps) {
  const [form, setForm] = useState<HousekeepingFormData>(EMPTY_FORM);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
        setForm(EMPTY_FORM);
    }
  }, [initialData]);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === form.propertyId) || null,
    [properties, form.propertyId]
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === form.roomId) || null,
    [rooms, form.roomId]
  );

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === form.assignedToEmployeeId) || null,
    [employees, form.assignedToEmployeeId]
  );

  function validateChecklistJson(value: string) {
    try {
      if (!value) return true;
      JSON.parse(value);
      setChecklistError(null);
      return true;
    } catch {
      setChecklistError("Checklist must be valid JSON.");
      return false;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateChecklistJson(form.checklist)) return;
    await onSubmit(form);
  }

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
        <Icon sx={{ color: tokens.colors.primary.main }} />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    }
  };

  return (
    <Stack spacing={3}>
      <Box component="form" onSubmit={handleSubmit}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader 
                icon={HousekeepingIcon} 
                title={isEditing ? "Edit Task" : "New Task"} 
                subtitle={isEditing ? "Update housekeeping task details" : "Create a new cleaning task"} 
            />
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={properties}
                  getOptionLabel={(option) => option.name}
                  value={selectedProperty}
                  onChange={(_, newValue) => {
                    setForm({ ...form, propertyId: newValue?.id || "" });
                  }}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Property"
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldSx}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={rooms}
                  getOptionLabel={(option) => option.roomNumber}
                  value={selectedRoom}
                  onChange={(_, newValue) => {
                    setForm({ ...form, roomId: newValue?.id || "" });
                  }}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Room"
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldSx}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type="date"
                  label="Date"
                  value={form.taskDate}
                  onChange={(e) => setForm({ ...form, taskDate: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Shift"
                  value={form.shift}
                  onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  {SHIFTS.map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  {STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  value={selectedEmployee}
                  onChange={(_, newValue) => {
                    setForm({ ...form, assignedToEmployeeId: newValue?.id || "" });
                  }}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned Employee"
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldSx}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Checklist (JSON)"
                  value={form.checklist}
                  onChange={(e) => {
                      const value = e.target.value;
                      setForm({ ...form, checklist: value });
                      validateChecklistJson(value);
                  }}
                  error={!!checklistError}
                  helperText={checklistError}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ style: { fontFamily: 'monospace' } }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        {isEditing && events.length > 0 && (
          <Card
            sx={{
                borderRadius: 3,
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                mb: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Status History
                </Typography>
                <List dense disablePadding>
                  {events.map((event, index) => (
                    <ListItem key={index} divider={index < events.length - 1} sx={{ px: 0 }}>
                      <Grid container alignItems="center">
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {event.status}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.changedAt).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="body2" align="right" color="text.secondary">
                            {event.changedByUserId || "System"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
            </CardContent>
          </Card>
        )}

        <Box sx={{ textAlign: 'right' }}>
            <Button
              onClick={onCancel}
              variant="outlined"
              disabled={isSubmitting}
              sx={{
                px: 3,
                py: 1,
                mr: 2,
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
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.3)}`,
              }}
            >
              {isEditing ? "Update Task" : "Create Task"}
            </Button>
        </Box>
      </Box>
    </Stack>
  );
}
