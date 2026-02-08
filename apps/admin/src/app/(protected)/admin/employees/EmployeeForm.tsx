"use client";

import { useState, useRef } from "react";
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
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Badge as EmployeeIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Home as AddressIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { uploadSupabaseFile, buildSupabaseObjectPath } from "@/lib/storage/supabase";

type Property = {
  id: string;
  name: string;
};

export type EmployeeFormData = {
  propertyId: string;
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
  jobTitle: string;
  department: string;
  hireDate: string;
  hourlyRate: string;
  skills: string;
  photoUrl: string;
  employmentStatus: string;
};

const STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;

const EMPTY_FORM: EmployeeFormData = {
  propertyId: "",
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
  jobTitle: "",
  department: "",
  hireDate: "",
  hourlyRate: "",
  skills: "",
  photoUrl: "",
  employmentStatus: "ACTIVE"
};

interface EmployeeFormProps {
  initialData?: EmployeeFormData | null;
  properties: Property[];
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function EmployeeForm({
  initialData,
  properties,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>(initialData || EMPTY_FORM);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingPhoto(true);
    try {
      const file = e.target.files[0];
      const path = buildSupabaseObjectPath("employees/profile", file.name);
      const url = await uploadSupabaseFile(file, path);
      setForm(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload profile image");
    } finally {
      setUploadingPhoto(false);
    }
  };

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

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    }
  };

  return (
    <Stack spacing={3}>
      <Box component="form" onSubmit={handleSubmit}>
        {/* Profile Image Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader icon={ImageIcon} title="Profile Photo" subtitle="Upload employee profile picture" />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 3,
                borderRadius: 3,
                bgcolor: tokens.colors.grey[50],
                border: `1px solid ${tokens.colors.grey[100]}`,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: 'white',
                  border: `2px dashed ${form.photoUrl ? 'transparent' : tokens.colors.grey[300]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: tokens.colors.primary.main,
                    '& .upload-overlay': {
                      opacity: 1,
                    }
                  }
                }}
                onClick={() => photoInputRef.current?.click()}
              >
                {form.photoUrl ? (
                  <>
                    <Avatar
                      src={form.photoUrl}
                      sx={{ width: '100%', height: '100%' }}
                    />
                    <Box
                      className="upload-overlay"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        borderRadius: '50%',
                      }}
                    >
                      <UploadIcon sx={{ color: 'white' }} />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    {uploadingPhoto ? (
                      <CircularProgress size={32} />
                    ) : (
                      <>
                        <UploadIcon sx={{ fontSize: 32, color: tokens.colors.grey[400], mb: 1 }} />
                        <Typography variant="caption" color="text.secondary" display="block">
                          Click to upload
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={photoInputRef}
                onChange={handlePhotoUpload}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                  Employee Photo
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  This image will be displayed in the employee profile. Recommended size: 400×400px, max 5MB.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploadingPhoto ? <CircularProgress size={16} /> : <UploadIcon />}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  sx={{ borderRadius: 2 }}
                >
                  {form.photoUrl ? "Change Photo" : "Upload Photo"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Basic Info Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader icon={PersonIcon} title="Basic Information" subtitle="Personal details of the employee" />
            <Grid container spacing={2}>
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
                  <MenuItem value="">Select Property</MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={form.employmentStatus}
                  onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  {STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Employment Info Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader icon={WorkIcon} title="Employment Details" subtitle="Job-related information" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Hire Date"
                  value={form.hireDate}
                  onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Hourly Rate"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Skills (comma separated)"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Housekeeping, Front Desk, Maintenance"
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader icon={AddressIcon} title="Address" subtitle="Employee residence details" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Action Buttons */}
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
            {isEditing ? "Update Employee" : "Create Employee"}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
