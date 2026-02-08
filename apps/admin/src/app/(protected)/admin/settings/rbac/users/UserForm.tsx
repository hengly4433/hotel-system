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
  Autocomplete,
  Chip,
} from "@mui/material";
import { Person as UserIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Role = {
  id: string;
  name: string;
};

export type UserFormData = {
  email: string;
  password: string;
  newPassword: string;
  status: "ACTIVE" | "SUSPENDED";
  propertyId: string;
  roleIds: string[];
};

const EMPTY_FORM: UserFormData = {
  email: "",
  password: "",
  newPassword: "",
  status: "ACTIVE",
  propertyId: "",
  roleIds: [],
};

type UserFormProps = {
  initialData?: UserFormData | null;
  roles: Role[];
  onSubmit: (data: UserFormData) => Promise<void>;
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

export default function UserForm({
  initialData,
  roles,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>(initialData || EMPTY_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader
              icon={UserIcon}
              title="User Information"
              subtitle="Account details and access settings"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="user@example.com"
                  sx={textFieldSx}
                />
              </Grid>

              {!isEditing ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldSx}
                  />
                </Grid>
              ) : (
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="New Password (Optional)"
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    fullWidth
                    size="small"
                    helperText="Leave blank to keep current password"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldSx}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "SUSPENDED" })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Property ID (Optional)"
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  multiple
                  options={roles}
                  getOptionLabel={(option) => option.name}
                  value={roles.filter((r) => form.roleIds.includes(r.id))}
                  onChange={(event, newValue) => {
                    setForm({
                      ...form,
                      roleIds: newValue.map((r) => r.id),
                    });
                  }}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Roles"
                      placeholder="Select roles..."
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldSx}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option.name}
                          size="small"
                          {...tagProps}
                        />
                      );
                    })
                  }
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
            {isSubmitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
