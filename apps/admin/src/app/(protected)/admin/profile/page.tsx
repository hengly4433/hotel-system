"use client";

import { useState, useRef, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Divider,
    Alert,
    IconButton,
    CircularProgress,
    InputAdornment
} from "@mui/material";
import {
    Save,
    CloudUpload,
    Lock,
    Visibility,
    VisibilityOff,
    Person
} from "@mui/icons-material";
import PageHeader from "@/components/ui/PageHeader";
import { tokens } from "@/lib/theme";
import { useUser } from "@/hooks/useUser";
import { uploadSupabaseFile, buildSupabaseObjectPath } from "@/lib/storage/supabase";
import { apiFetch } from "@/lib/api/client";
import { useSnackbar } from "notistack";

export default function ProfilePage() {
    const { user, loading: userLoading, refetch } = useUser();
    const { enqueueSnackbar } = useSnackbar();

    // Profile Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Password Form State
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Image Upload State
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            if (user.profileImage) {
                console.log("Profile Image URL:", user.profileImage);
            }
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            await apiFetch("me/profile", {
                method: "PUT",
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email: user?.email // maintain existing email
                })
            });
            enqueueSnackbar("Profile updated successfully", { variant: "success" });
            refetch();
        } catch (err) {
            enqueueSnackbar(err instanceof Error ? err.message : "Failed to update profile", { variant: "error" });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            enqueueSnackbar("Passwords do not match", { variant: "error" });
            return;
        }

        setUpdatingPassword(true);
        try {
            await apiFetch("me/profile/password", {
                method: "PUT",
                body: JSON.stringify({ password })
            });
            enqueueSnackbar("Password updated successfully", { variant: "success" });
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            enqueueSnackbar(err instanceof Error ? err.message : "Failed to update password", { variant: "error" });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            // 1. Upload to Supabase
            if (!user?.id) throw new Error("User ID not found");
            const path = buildSupabaseObjectPath(`profiles/${user.id}`, file.name);
            const publicUrl = await uploadSupabaseFile(file, path);

            // 2. Update User Profile with new image URL
            await apiFetch("me/profile", {
                method: "PUT",
                body: JSON.stringify({
                    profileImage: publicUrl,
                    email: user?.email // maintain existing email
                })
            });

            enqueueSnackbar("Profile image updated", { variant: "success" });
            refetch();
        } catch (err) {
            enqueueSnackbar(err instanceof Error ? err.message : "Failed to upload image", { variant: "error" });
        } finally {
            setUploadingImage(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (userLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 6 }}>
            <PageHeader
                title="My Profile"
                subtitle="Manage your personal information and security settings"
            />

            <Grid container spacing={3}>
                {/* Left Column: Profile Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: "18px",
                        border: `1px solid ${tokens.colors.grey[200]}`,
                        boxShadow: tokens.shadows.card
                    }}>
                        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                            <Avatar
                                src={user?.profileImage || undefined}
                                alt={user?.firstName || "User"}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: "auto",
                                    border: `4px solid ${tokens.colors.grey[100]}`,
                                    fontSize: 48,
                                    bgcolor: tokens.colors.primary.main
                                }}
                                imgProps={{
                                    style: { objectPosition: 'top', objectFit: 'cover' }
                                }}
                            >
                                {!user?.profileImage && (user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                            </Avatar>
                            <IconButton
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: "background.paper",
                                    boxShadow: 2,
                                    "&:hover": { bgcolor: tokens.colors.grey[100] }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? <CircularProgress size={20} /> : <CloudUpload fontSize="small" />}
                            </IconButton>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </Box>

                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {user?.email}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{
                                bgcolor: tokens.colors.grey[100],
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 600,
                                color: tokens.colors.grey[600],
                                textTransform: "uppercase"
                            }}>
                                {user?.roleIds && user.roleIds.length > 0 ? "Administrator" : "User"}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column: Forms */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                        {/* Personal Information */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: "18px",
                            border: `1px solid ${tokens.colors.grey[200]}`,
                            boxShadow: tokens.shadows.card
                        }}>
                            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: tokens.colors.primary.light + "20" }}>
                                    <Person sx={{ color: tokens.colors.primary.main }} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                            </Box>

                            <form onSubmit={handleUpdateProfile}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={updatingProfile}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={updatingProfile}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            value={user?.email || ""}
                                            disabled
                                            helperText="Email cannot be changed"
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<Save />}
                                            disabled={updatingProfile}
                                            sx={{ mt: 1 }}
                                        >
                                            {updatingProfile ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>

                        {/* Security */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: "18px",
                            border: `1px solid ${tokens.colors.grey[200]}`,
                            boxShadow: tokens.shadows.card
                        }}>
                            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: tokens.colors.error.light + "20" }}>
                                    <Lock sx={{ color: tokens.colors.error.main }} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Security</Typography>
                            </Box>

                            <form onSubmit={handleUpdatePassword}>
                                <Grid container spacing={2}>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="New Password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={updatingPassword}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Confirm New Password"
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={updatingPassword}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Button
                                            type="submit"
                                            variant="outlined"
                                            color="primary" // Changed to primary as it's a positive action
                                            disabled={updatingPassword || !password}
                                            sx={{ mt: 1 }}
                                        >
                                            {updatingPassword ? "Updating..." : "Update Password"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>

                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
