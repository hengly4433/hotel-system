"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Stack,
  alpha,
} from "@mui/material";
import {
  Business as PropertyIcon,
  Home as AddressIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Organization = {
  id: string;
  name: string;
};

export type PropertyFormData = {
  organizationId: string;
  name: string;
  timezone: string;
  currency: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY_FORM: PropertyFormData = {
  organizationId: "",
  name: "",
  timezone: "",
  currency: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

type PropertyFormProps = {
  initialData?: PropertyFormData | null;
  organizations: Organization[];
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
  }
};

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
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
}

export default function PropertyForm({
  initialData,
  organizations,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: PropertyFormProps) {
  const [form, setForm] = useState<PropertyFormData>(initialData || EMPTY_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* Basic Info */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader
              icon={PropertyIcon}
              title="Property Information"
              subtitle="Basic details about the property"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  size="small"
                  label="Organization"
                  value={form.organizationId}
                  onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  <MenuItem value="">Select</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Timezone"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Asia/Phnom_Penh"
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Currency"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., USD"
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Address */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader
              icon={AddressIcon}
              title="Address"
              subtitle="Property location details"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Address Line 1"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Address Line 2"
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={onCancel}
            variant="outlined"
            sx={{ px: 3, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              px: 4,
              borderRadius: 2,
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Property" : "Create Property"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
