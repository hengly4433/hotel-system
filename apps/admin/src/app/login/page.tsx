"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const next = searchParams.get("next") || "/";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Login failed");
      }

      router.push(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
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
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", // Premium Slate Gradient
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ mb: 4, textAlign: "center" }}>
             <Box sx={{
                 width: 64, height: 64, borderRadius: '16px',
                 background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', // Sky blue gradient
                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 color: 'white', fontWeight: 800, fontSize: '2rem',
                 boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                 mx: "auto",
                 mb: 2
             }}>S</Box>
            <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(45deg, #0f172a, #0ea5e9)', // Dark slate to sky blue
                backgroundClip: 'text',
                textFillColor: 'transparent',
                letterSpacing: '-0.5px'
            }}>
              Sky High Hotel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Admin Portal
            </Typography>
        </Box>

        <Card
          sx={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)", // Softer shadow
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold">
                Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                Please enter your details to sign in
                </Typography>
            </Box>

            <form onSubmit={onSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                required
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)", // Sky blue shadow
                  background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                  '&:hover': {
                      background: 'linear-gradient(to right, #0284c7, #0369a1)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" underline="hover" fontWeight="bold">
                    Create Account
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 3, textAlign: "center" }}>
             <Typography variant="caption" color="text.secondary">
                 &copy; {new Date().getFullYear()} Sky High Hotel. All rights reserved.
             </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
