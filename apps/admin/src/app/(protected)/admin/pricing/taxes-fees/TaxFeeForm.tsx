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
  Switch,
  Stack,
  alpha,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import {
  Receipt as TaxIcon,
  Business as PropertyIcon,
  Percent as PercentIcon,
  AttachMoney as FixedIcon,
  Category as TypeIcon
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { useState } from "react";

type TaxFee = {
  id: string;
  propertyId: string;
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  appliesTo: string;
  active: boolean;
};

interface TaxFeeFormProps {
  initialData?: TaxFee | null;
  properties: Array<{ id: string; name: string }>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function TaxFeeForm({
  initialData,
  properties,
  onSubmit,
  onCancel,
  isSubmitting = false
}: TaxFeeFormProps) {
  const [form, setForm] = useState({
    propertyId: initialData?.propertyId || "",
    name: initialData?.name || "",
    type: initialData?.type || "PERCENT",
    value: initialData?.value?.toString() || "",
    appliesTo: initialData?.appliesTo || "ALL",
    active: initialData?.active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      value: Number(form.value)
    });
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
            <SectionHeader icon={TaxIcon} title="Tax & Fee Details" subtitle="Configure tax or fee rule information" />
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
                  placeholder="e.g. VAT, Service Charge"
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  <MenuItem value="PERCENT">Percent (%)</MenuItem>
                  <MenuItem value="FIXED">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Value"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: "0.0001" }}
                  slotProps={{
                    input: {
                      startAdornment: form.type === "PERCENT" 
                        ? <PercentIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        : <FixedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                    }
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Applies To"
                  value={form.appliesTo}
                  onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  <MenuItem value="ALL">All services & rooms</MenuItem>
                  <MenuItem value="ROOM">Room only</MenuItem>
                  <MenuItem value="SERVICE">Service only</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: form.active ? alpha(tokens.colors.success.main, 0.08) : tokens.colors.grey[50],
                    border: `1px solid ${form.active ? alpha(tokens.colors.success.main, 0.3) : tokens.colors.grey[200]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: form.active ? tokens.colors.success.main : tokens.colors.grey[400],
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {form.active ? 'Active' : 'Inactive'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tax/Fee status
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    color="success"
                  />
                </Box>
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
            {initialData ? "Update Tax/Fee" : "Create Tax/Fee"}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
