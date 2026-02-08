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
import { Business as OrgIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export type OrganizationFormData = {
  name: string;
};

const EMPTY_FORM: OrganizationFormData = {
  name: "",
};

type OrganizationFormProps = {
  initialData?: OrganizationFormData | null;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
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

export default function OrganizationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: OrganizationFormProps) {
  const [form, setForm] = useState<OrganizationFormData>(initialData || EMPTY_FORM);

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
              icon={OrgIcon}
              title="Organization Information"
              subtitle="Hotel group or chain details"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Organization Name"
                  placeholder="e.g., Marriott International"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
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
            {isSubmitting ? "Saving..." : isEditing ? "Update Organization" : "Create Organization"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
