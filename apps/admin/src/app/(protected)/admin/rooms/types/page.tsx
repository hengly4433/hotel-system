"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { buildSupabaseObjectPath, uploadSupabaseFile } from "@/lib/storage/supabase";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Typography,
  Stack,
  Grid,
  TablePagination,
  Avatar
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

type Property = {
  id: string;
  name: string;
};

type RoomTypeImage = {
  url: string;
  isPrimary: boolean;
};

type RoomType = {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  baseDescription: string | null;
  defaultBedType: string | null;
  images: RoomTypeImage[];
};

const EMPTY_FORM = {
  propertyId: "",
  code: "",
  name: "",
  maxAdults: 1,
  maxChildren: 0,
  maxOccupancy: 1,
  baseDescription: "",
  defaultBedType: "",
  images: [] as RoomTypeImage[]
};

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [typesData, propertiesData] = await Promise.all([
        apiJson<RoomType[]>("room-types"),
        apiJson<Property[]>("properties")
      ]);
      setRoomTypes(typesData);
      setProperties(propertiesData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function startEdit(roomType: RoomType) {
    setEditingId(roomType.id);
    setForm({
      propertyId: roomType.propertyId,
      code: roomType.code,
      name: roomType.name,
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
      maxOccupancy: roomType.maxOccupancy,
      baseDescription: roomType.baseDescription || "",
      defaultBedType: roomType.defaultBedType || "",
      images: roomType.images || []
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      code: form.code,
      name: form.name,
      maxAdults: Number(form.maxAdults),
      maxChildren: Number(form.maxChildren),
      maxOccupancy: Number(form.maxOccupancy),
      baseDescription: form.baseDescription || null,
      defaultBedType: form.defaultBedType || null,
      images: form.images.map((image, index) => ({
        url: image.url,
        isPrimary: image.isPrimary,
        sortOrder: index
      }))
    };

    try {
      if (editingId) {
        await apiJson(`room-types/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiJson("room-types", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      await loadData();
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this room type?")) return;
    try {
      await apiJson(`room-types/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    properties.forEach((property) => map.set(property.id, property.name));
    return map;
  }, [properties]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!form.code) {
      setError("Add a room type code before uploading images.");
      return;
    }
    setUploading(true);
    try {
      const uploads: RoomTypeImage[] = [];
      for (const file of Array.from(files)) {
        const path = buildSupabaseObjectPath(`room-types/${form.code}`, file.name);
        const url = await uploadSupabaseFile(file, path);
        uploads.push({ url, isPrimary: false });
      }
      setForm((prev) => {
        const images = [...prev.images, ...uploads];
        if (images.length > 0 && !images.some((img) => img.isPrimary)) {
          images[0] = { ...images[0], isPrimary: true };
        }
        return { ...prev, images };
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function setPrimaryImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((image, idx) => ({
        ...image,
        isPrimary: idx === index
      }))
    }));
  }

  function removeImage(index: number) {
    setForm((prev) => {
      const images = prev.images.filter((_, idx) => idx !== index);
      if (images.length > 0 && !images.some((img) => img.isPrimary)) {
        images[0] = { ...images[0], isPrimary: true };
      }
      return { ...prev, images };
    });
  }

  return (
    <main>
      <PageHeader title="Room Types" subtitle="Manage room categories" />
      
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {editingId ? "Edit Room Type" : "Create Room Type"}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="room-type-property"
                                select
                                label="Property"
                                value={form.propertyId}
                                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                                required
                                fullWidth
                            >
                                <MenuItem value="">Select</MenuItem>
                                {properties.map((property) => (
                                  <MenuItem key={property.id} value={property.id}>
                                    {property.name}
                                  </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="room-type-code"
                                label="Code"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="room-type-name"
                                label="Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                fullWidth
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                id="room-type-max-adults"
                                type="number"
                                label="Max Adults"
                                value={form.maxAdults}
                                onChange={(e) => setForm({ ...form, maxAdults: Number(e.target.value) })}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                id="room-type-max-children"
                                type="number"
                                label="Max Children"
                                value={form.maxChildren}
                                onChange={(e) => setForm({ ...form, maxChildren: Number(e.target.value) })}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                id="room-type-max-occupancy"
                                type="number"
                                label="Max Occupancy"
                                value={form.maxOccupancy}
                                onChange={(e) => setForm({ ...form, maxOccupancy: Number(e.target.value) })}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                id="room-type-base-description"
                                label="Base Description"
                                value={form.baseDescription}
                                onChange={(e) => setForm({ ...form, baseDescription: e.target.value })}
                                fullWidth
                                multiline
                                minRows={3}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                id="room-type-default-bed-type"
                                label="Default Bed Type"
                                value={form.defaultBedType}
                                onChange={(e) => setForm({ ...form, defaultBedType: e.target.value })}
                                fullWidth
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Room Images
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={uploading}
                                    >
                                        {uploading ? "Uploading..." : "Upload Images"}
                                        <input
                                          id="room-type-image-upload"
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          hidden
                                          onChange={(event) => void handleImageUpload(event.target.files)}
                                        />
                                    </Button>
                                </Stack>

                                {form.images.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary">
                                    No images uploaded yet.
                                  </Typography>
                                ) : (
                                  <Stack spacing={2}>
                                    <Stack spacing={1}>
                                      {form.images.map((image, index) => (
                                        <Stack
                                          key={`${image.url}-${index}`}
                                          direction="row"
                                          spacing={2}
                                          alignItems="center"
                                        >
                                          <Avatar src={image.url} variant="rounded" sx={{ width: 64, height: 64 }} />
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" noWrap>
                                              {image.url}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                              <Button
                                                size="small"
                                                variant={image.isPrimary ? "contained" : "outlined"}
                                                onClick={() => setPrimaryImage(index)}
                                              >
                                                {image.isPrimary ? "Primary" : "Make Primary"}
                                              </Button>
                                              <Button
                                                size="small"
                                                color="error"
                                                variant="text"
                                                onClick={() => removeImage(index)}
                                              >
                                                Remove
                                              </Button>
                                            </Stack>
                                          </Box>
                                        </Stack>
                                      ))}
                                    </Stack>

                                    <Box>
                                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Gallery preview
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "grid",
                                          gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                                          gap: 1
                                        }}
                                      >
                                        {form.images.map((image, index) => (
                                          <Box
                                            key={`gallery-${image.url}-${index}`}
                                            sx={{
                                              position: "relative",
                                              borderRadius: 1,
                                              overflow: "hidden",
                                              border: "1px solid",
                                              borderColor: image.isPrimary ? "primary.main" : "divider"
                                            }}
                                          >
                                            <Box
                                              component="img"
                                              src={image.url}
                                              alt={`Room image ${index + 1}`}
                                              sx={{ width: "100%", height: 96, objectFit: "cover", display: "block" }}
                                            />
                                            {image.isPrimary && (
                                              <Box
                                                sx={{
                                                  position: "absolute",
                                                  top: 6,
                                                  left: 6,
                                                  bgcolor: "primary.main",
                                                  color: "primary.contrastText",
                                                  px: 0.5,
                                                  py: 0.25,
                                                  borderRadius: 0.5,
                                                  fontSize: "0.7rem",
                                                  fontWeight: 600
                                                }}
                                              >
                                                Primary
                                              </Box>
                                            )}
                                          </Box>
                                        ))}
                                      </Box>
                                    </Box>
                                  </Stack>
                                )}
                            </Stack>
                        </Grid>

                         <Grid size={{ xs: 12 }}>
                             <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    disabled={loading}
                                    startIcon={!editingId && !loading && <AddIcon />}
                                >
                                    {loading ? "Saving..." : editingId ? "Update" : "Create"}
                                </Button>
                                {editingId && (
                                    <Button variant="outlined" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: 60 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Adults / Children</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Max Occupancy</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Images</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {roomTypes
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((roomType, index) => (
                    <TableRow key={roomType.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{propertyMap.get(roomType.propertyId) || roomType.propertyId}</TableCell>
                        <TableCell>{roomType.code}</TableCell>
                        <TableCell>{roomType.name}</TableCell>
                        <TableCell>{roomType.maxAdults} / {roomType.maxChildren}</TableCell>
                        <TableCell>{roomType.maxOccupancy}</TableCell>
                        <TableCell>{roomType.images?.length ?? 0}</TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(roomType)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(roomType.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                    {roomTypes.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No room types found
                        </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={roomTypes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Card>
      </Stack>
    </main>
  );
}
