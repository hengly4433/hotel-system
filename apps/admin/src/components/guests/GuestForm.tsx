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
  CircularProgress
} from "@mui/material";
import { Person as PersonIcon, Star as StarIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export type GuestFormData = {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  loyaltyTier: string;
  notes: string;
};

const TIERS = ["NONE", "SILVER", "GOLD", "PLATINUM"] as const;

const TIER_COLORS: Record<string, { bg: string; color: string; gradient?: string }> = {
  NONE: { bg: tokens.colors.grey[100], color: tokens.colors.grey[600] },
  SILVER: { bg: alpha('#94a3b8', 0.15), color: '#475569', gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
  GOLD: { bg: alpha('#f59e0b', 0.15), color: '#b45309', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
  PLATINUM: { bg: alpha('#8b5cf6', 0.15), color: '#6d28d9', gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' },
};

const EMPTY_FORM: GuestFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  loyaltyTier: "NONE",
  notes: "",
};

interface GuestFormProps {
  initialData?: GuestFormData | null;
  onSubmit: (data: GuestFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function GuestForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: GuestFormProps) {
  const [form, setForm] = useState<GuestFormData>(initialData || EMPTY_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
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

  return (
    <Stack spacing={3} sx={{ pb: 20 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader 
              icon={PersonIcon} 
              title={isEditing ? "Edit Guest" : "Create New Guest"} 
              subtitle={isEditing ? "Update guest information" : "Add a new guest to the system"} 
            />
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Loyalty Tier"
                  value={form.loyaltyTier}
                  onChange={(e) => setForm({ ...form, loyaltyTier: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                >
                  {TIERS.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {tier !== 'NONE' && <StarIcon sx={{ fontSize: 16, color: TIER_COLORS[tier].color }} />}
                        {tier}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: tokens.colors.grey[700] }}>
                  Address Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={form.addressLine2}
                      onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sticky Footer Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: { xs: '100%', md: 'calc(100% - 260px)' },
            px: 3,
            pt: 2,
            pb: 2,
            bgcolor: 'background.paper',
            borderTop: `1px solid ${tokens.colors.grey[200]}`,
            zIndex: 20,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button
            onClick={onCancel}
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              px: 3,
              py: 1,
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
            {isEditing ? "Update Guest" : "Create Guest"}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
