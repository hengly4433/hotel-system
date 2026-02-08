"use client";

import { useMemo, useState } from "react";
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
import { Build as MaintenanceIcon } from "@mui/icons-material";
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

export type MaintenanceFormData = {
  propertyId: string;
  roomId: string;
  priority: string;
  status: string;
  description: string;
  reportedByUserId: string;
  assignedToEmployeeId: string;
};

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const EMPTY_FORM: MaintenanceFormData = {
  propertyId: "",
  roomId: "",
  priority: "MEDIUM",
  status: "OPEN",
  description: "",
  reportedByUserId: "",
  assignedToEmployeeId: "",
};

type MaintenanceFormProps = {
  initialData?: MaintenanceFormData;
  properties: Property[];
  rooms: Room[];
  employees: Employee[];
  events?: StatusEvent[];
  onSubmit: (data: MaintenanceFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
};

export default function MaintenanceForm({
  initialData,
  properties,
  rooms,
  employees,
  events = [],
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
}: MaintenanceFormProps) {
  const [form, setForm] = useState<MaintenanceFormData>(initialData || EMPTY_FORM);

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: tokens.shadows.card,
        border: `1px solid ${tokens.colors.grey[200]}`,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: alpha(tokens.colors.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaintenanceIcon sx={{ color: tokens.colors.primary.main }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {isEditing ? "Edit Ticket" : "Create New Ticket"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? "Update maintenance ticket" : "Add a new work order"}
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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

            <Grid size={{ xs: 12 }}>
              <TextField
                multiline
                rows={3}
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Reported By (User ID)"
                value={form.reportedByUserId}
                onChange={(e) => setForm({ ...form, reportedByUserId: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
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

            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
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
                  {isEditing ? "Update Ticket" : "Create Ticket"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Status Timeline */}
        {isEditing && events.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Status Timeline
            </Typography>
            <List dense disablePadding>
              {events.map((event, index) => (
                <ListItem key={index} divider={index < events.length - 1}>
                  <Grid container>
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
                      <Typography variant="body2" align="right">
                        {event.changedByUserId || "system"}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
