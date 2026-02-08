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
import { Menu as MenuIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export type MenuFormData = {
  key: string;
  label: string;
  sortOrder: string;
};

const EMPTY_FORM: MenuFormData = {
  key: "",
  label: "",
  sortOrder: "0",
};

type MenuFormProps = {
  initialData?: MenuFormData | null;
  onSubmit: (data: MenuFormData) => Promise<void>;
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

export default function MenuForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: MenuFormProps) {
  const [form, setForm] = useState<MenuFormData>(initialData || EMPTY_FORM);

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
              icon={MenuIcon}
              title="Menu Information"
              subtitle="Define the top-level navigation group"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Key"
                  placeholder="e.g., settings, reservations"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  required
                  disabled={isEditing}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText={isEditing ? "Key cannot be changed" : "Unique identifier for this menu"}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Label"
                  placeholder="e.g., Settings, Reservations"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Display name in the navigation"
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Sort Order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Lower values appear first"
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
            {isSubmitting ? "Saving..." : isEditing ? "Update Menu" : "Create Menu"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
