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
  Grid,
  alpha,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Schedule as TimesheetIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Property = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  propertyId: string;
};

export type TimesheetFormData = {
  propertyId: string;
  employeeId: string;
  workDate: string;
  shift: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: string;
  status: string;
  notes: string;
};

const STATUSES = ["OPEN", "SUBMITTED", "APPROVED", "REJECTED"] as const;
const SHIFTS = ["AM", "PM", "NIGHT"] as const;

const EMPTY_FORM: TimesheetFormData = {
  propertyId: "",
  employeeId: "",
  workDate: "",
  shift: "AM",
  clockIn: "",
  clockOut: "",
  breakMinutes: "0",
  status: "OPEN",
  notes: "",
};

type TimesheetFormProps = {
  initialData?: TimesheetFormData;
  properties: Property[];
  employees: Employee[];
  onSubmit: (data: TimesheetFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
};

export default function TimesheetForm({
  initialData,
  properties,
  employees,
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
}: TimesheetFormProps) {
  const [form, setForm] = useState<TimesheetFormData>(initialData || EMPTY_FORM);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === form.propertyId) || null,
    [properties, form.propertyId]
  );

  const employeesForProperty = useMemo(() => {
    if (!form.propertyId) return employees;
    return employees.filter((emp) => emp.propertyId === form.propertyId);
  }, [employees, form.propertyId]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === form.employeeId) || null,
    [employees, form.employeeId]
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
            <TimesheetIcon sx={{ color: tokens.colors.primary.main }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {isEditing ? "Edit Timesheet" : "Create New Timesheet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? "Update timesheet details" : "Add a new time entry"}
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
                  setForm({ ...form, propertyId: newValue?.id || "", employeeId: "" });
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
                options={employeesForProperty}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                value={selectedEmployee}
                onChange={(_, newValue) => {
                  setForm({ ...form, employeeId: newValue?.id || "" });
                }}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee"
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
                type="date"
                label="Work Date"
                value={form.workDate}
                onChange={(e) => setForm({ ...form, workDate: e.target.value })}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="datetime-local"
                label="Clock In"
                value={form.clockIn}
                onChange={(e) => setForm({ ...form, clockIn: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="datetime-local"
                label="Clock Out"
                value={form.clockOut}
                onChange={(e) => setForm({ ...form, clockOut: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="Break Minutes"
                value={form.breakMinutes}
                onChange={(e) => setForm({ ...form, breakMinutes: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
                sx={textFieldSx}
              />
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
                rows={2}
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
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
                  {isEditing ? "Update Timesheet" : "Create Timesheet"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
