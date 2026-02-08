"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import Breadcrumb from "./Breadcrumb";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export default function PageHeader({ title, subtitle, action, showBack }: PageHeaderProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        mb: 4,
        position: "sticky",
        top: -24,
        zIndex: 10,
        bgcolor: "background.default",
        pt: 3,
        pb: 2,
      }}
    >
      <Breadcrumb />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {showBack && (
            <IconButton
              onClick={() => router.back()}
              size="small"
              sx={{
                mt: 0.5,
                color: tokens.colors.grey[600],
                '&:hover': {
                  bgcolor: tokens.colors.grey[100],
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ position: 'relative' }}>
            {/* Simple accent line */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 4,
                height: '100%',
                borderRadius: 1,
                bgcolor: tokens.colors.primary.main,
              }}
            />
            <Box sx={{ pl: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 700, color: tokens.colors.grey[900], letterSpacing: '-0.3px' }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography sx={{ color: tokens.colors.grey[500], mt: 0.5, fontSize: "0.9rem" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
}

