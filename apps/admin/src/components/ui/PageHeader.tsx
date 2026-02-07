"use client";

import { Box, Typography, alpha } from "@mui/material";
import { tokens } from "@/lib/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
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
      {action && <Box>{action}</Box>}
    </Box>
  );
}
