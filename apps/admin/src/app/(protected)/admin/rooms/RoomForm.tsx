"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Grid,
  Switch,
  Stack,
  alpha,
  Avatar,
  CircularProgress,
  Divider,
  Chip
} from "@mui/material";
import {
  Close as CloseIcon,
  MeetingRoom as RoomIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Collections as GalleryIcon,
  Business as PropertyIcon,
  Layers as FloorIcon,
  Info as InfoIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { Room, RoomImage } from "./types";
import { useState, useRef } from "react";
import { uploadSupabaseFile, buildSupabaseObjectPath } from "@/lib/storage/supabase";

interface RoomFormProps {
  initialData?: Room | null;
  properties: Array<{ id: string; name: string }>;
  roomTypes: Array<{ id: string; name: string; propertyId: string }>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function RoomForm({
  initialData,
  properties,
  roomTypes,
  onSubmit,
  onCancel,
  isSubmitting = false
}: RoomFormProps) {
  const [form, setForm] = useState({
    roomNumber: initialData?.roomNumber || "",
    roomTypeId: initialData?.roomTypeId || "",
    propertyId: initialData?.propertyId || "",
    floorNumber: initialData?.floorNumber?.toString() || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
    profileImage: initialData?.profileImage || "",
  });
  
  const [galleryImages, setGalleryImages] = useState<RoomImage[]>(initialData?.galleryImages || []);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingProfile(true);
    try {
        const file = e.target.files[0];
        const path = buildSupabaseObjectPath("rooms/profile", file.name);
        const url = await uploadSupabaseFile(file, path);
        setForm(prev => ({ ...prev, profileImage: url }));
    } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload profile image");
    } finally {
        setUploadingProfile(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingGallery(true);
    try {
        const files = Array.from(e.target.files);
        const newImages: RoomImage[] = [];
        
        for (const file of files) {
             const path = buildSupabaseObjectPath("rooms/gallery", file.name);
             const url = await uploadSupabaseFile(file, path);
             newImages.push({
                 url,
                 sortOrder: galleryImages.length + newImages.length
             });
        }
        
        setGalleryImages(prev => [...prev, ...newImages]);
    } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload gallery images");
    } finally {
        setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
      setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...form,
        floorNumber: form.floorNumber ? Number(form.floorNumber) : null,
        description: form.description || null,
        galleryImages
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
            <SectionHeader icon={ImageIcon} title="Profile Image" subtitle="Main display image for this room" />
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
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: 'white',
                  border: `2px dashed ${form.profileImage ? 'transparent' : tokens.colors.grey[300]}`,
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
                onClick={() => profileInputRef.current?.click()}
              >
                {form.profileImage ? (
                  <>
                    <Avatar
                      src={form.profileImage}
                      variant="rounded"
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
                      }}
                    >
                      <UploadIcon sx={{ color: 'white' }} />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    {uploadingProfile ? (
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
                ref={profileInputRef}
                onChange={handleProfileUpload}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                  Room Cover Photo
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  This image will be displayed as the main thumbnail. Recommended size: 800×600px, max 5MB.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploadingProfile ? <CircularProgress size={16} /> : <UploadIcon />}
                  onClick={() => profileInputRef.current?.click()}
                  disabled={uploadingProfile}
                  sx={{ borderRadius: 2 }}
                >
                  {form.profileImage ? "Change Image" : "Upload Image"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Room Details Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader icon={InfoIcon} title="Room Details" subtitle="Basic information about the room" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Room Number"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., 101, 202A"
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Property"
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value, roomTypeId: "" })}
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
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Room Type"
                  value={form.roomTypeId}
                  onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
                  required
                  disabled={!form.propertyId}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {roomTypes
                    .filter((type) => type.propertyId === form.propertyId)
                    .map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Floor Number"
                  value={form.floorNumber}
                  onChange={(e) => setForm({ ...form, floorNumber: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., 1, 2, 3"
                  slotProps={{
                    input: {
                      startAdornment: <FloorIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                    }
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="Optional room description..."
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: form.isActive ? alpha(tokens.colors.success.main, 0.08) : tokens.colors.grey[50],
                    border: `1px solid ${form.isActive ? alpha(tokens.colors.success.main, 0.3) : tokens.colors.grey[200]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: form.isActive ? tokens.colors.success.main : tokens.colors.grey[400],
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Room status
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    color="success"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <SectionHeader icon={GalleryIcon} title="Gallery" subtitle="Additional images for this room" />
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: tokens.colors.grey[50],
                border: `1px solid ${tokens.colors.grey[100]}`,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {galleryImages.map((img, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover .delete-btn': {
                        opacity: 1,
                      }
                    }}
                  >
                    <Avatar
                      src={img.url}
                      variant="rounded"
                      sx={{ width: '100%', height: '100%' }}
                    />
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 6,
                        left: 6,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        height: 22,
                        fontSize: 11,
                      }}
                    />
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={() => removeGalleryImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { bgcolor: 'white' }
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                ))}
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    border: `2px dashed ${tokens.colors.grey[300]}`,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: tokens.colors.primary.main,
                      bgcolor: alpha(tokens.colors.primary.main, 0.04),
                    }
                  }}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  {uploadingGallery ? (
                    <CircularProgress size={28} />
                  ) : (
                    <>
                      <AddIcon sx={{ fontSize: 28, color: tokens.colors.grey[400], mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Add Images
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
              />
              {galleryImages.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  {galleryImages.length} image{galleryImages.length > 1 ? 's' : ''} uploaded.
                </Typography>
              )}
            </Box>
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
            {initialData ? "Update Room" : "Create Room"}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
