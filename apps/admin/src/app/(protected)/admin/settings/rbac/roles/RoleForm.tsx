"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Stack,
  alpha,
} from "@mui/material";
import { Security as RoleIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export type RoleFormData = {
  name: string;
  propertyId: string;
};

const EMPTY_FORM: RoleFormData = {
  name: "",
  propertyId: "",
};

type RoleFormProps = {
  initialData?: RoleFormData | null;
  onSubmit: (data: RoleFormData) => Promise<void>;
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

export default function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: RoleFormProps) {
  const [form, setForm] = useState<RoleFormData>(initialData || EMPTY_FORM);

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
              icon={RoleIcon}
              title="Role Information"
              subtitle="Define the role name and scope"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Role Name"
                  placeholder="e.g., Front Desk, Manager, Housekeeper"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="A descriptive name for this role"
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Property ID (Optional)"
                  placeholder="Leave blank for global role"
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Restrict role to a specific property"
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
            {isSubmitting ? "Saving..." : isEditing ? "Update Role" : "Create Role"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
