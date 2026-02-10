"use client";

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
  CircularProgress
} from "@mui/material";
import {
  Policy as PolicyIcon,
  Business as PropertyIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { useState, useEffect } from "react";

type CancellationPolicy = {
  id: string;
  propertyId: string;
  name: string;
  rules: string;
};

interface CancellationPolicyFormProps {
  initialData?: CancellationPolicy | null;
  properties: Array<{ id: string; name: string }>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CancellationPolicyForm({
  initialData,
  properties,
  onSubmit,
  onCancel,
  isSubmitting = false
}: CancellationPolicyFormProps) {
  const [form, setForm] = useState({
    propertyId: initialData?.propertyId || "",
    name: initialData?.name || "",
    rules: initialData?.rules || "{}"
  });

  const [rulesError, setRulesError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        propertyId: initialData.propertyId,
        name: initialData.name,
        rules: initialData.rules || "{}"
      });
    }
  }, [initialData]);

  function validateRulesJson(value: string) {
    try {
      JSON.parse(value);
      setRulesError(null);
      return true;
    } catch {
      setRulesError("Rules must be valid JSON.");
      return false;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRulesJson(form.rules)) return;
    onSubmit(form);
  };

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
            <SectionHeader icon={PolicyIcon} title="Policy Details" subtitle="Configure cancellation policy rules" />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Property"
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <PropertyIcon sx={{ fontSize: 18 }} />
                      Select Property
                    </Box>
                  </MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g. Standard 24h"
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Rules (JSON)"
                  multiline
                  rows={6}
                  value={form.rules}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, rules: value });
                    validateRulesJson(value);
                  }}
                  error={!!rulesError}
                  helperText={rulesError}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ style: { fontFamily: 'monospace' } }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
            {initialData ? "Update Policy" : "Create Policy"}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
