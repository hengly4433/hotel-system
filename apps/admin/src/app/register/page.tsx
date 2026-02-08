"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  alpha,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Person } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${tokens.colors.grey[100]} 0%, ${tokens.colors.grey[200]} 100%)`,
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Logo Section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box 
            sx={{
              width: 64, 
              height: 64, 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 800, 
              fontSize: '2rem',
              boxShadow: `0 8px 24px ${alpha(tokens.colors.primary.main, 0.3)}`,
              mx: "auto",
              mb: 2,
            }}
          >
            S
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.colors.grey[900] }}>
            Sky High Hotel
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.grey[500], mt: 0.5, fontWeight: 500, letterSpacing: '1px' }}>
            CREATE YOUR ACCOUNT
          </Typography>
        </Box>

        {/* Register Card */}
        <Card
          sx={{
            boxShadow: `0 8px 32px ${alpha(tokens.colors.grey[900], 0.08)}`,
            borderRadius: 4,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Join the Team
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.grey[500], mt: 0.5 }}>
                Start managing your hotel today
              </Typography>
            </Box>

            <form onSubmit={onSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: tokens.colors.grey[400], fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: tokens.colors.grey[400], fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: tokens.colors.grey[400], fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                helperText="Must be at least 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: tokens.colors.grey[400], fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.3)}`,
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Create Account"}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: tokens.colors.grey[500] }}>
                  Already have an account?{" "}
                  <Link href="/login" underline="none" sx={{ fontWeight: 600, color: tokens.colors.primary.main }}>
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: tokens.colors.grey[400] }}>
            © {new Date().getFullYear()} Sky High Hotel. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
