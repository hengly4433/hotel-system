"use client";

import * as React from "react";
import { Card, Box, Typography, alpha } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

interface GradientCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  gradient: string;
  trend?: "up" | "down";
}

export function GradientCard({ 
  title, 
  value, 
  change, 
  gradient, 
  icon,
  trend,
}: GradientCardProps) {
  const isPositive = trend === "up" || (change?.toLowerCase().includes("increase"));
  
  return (
    <Card
      sx={{
        background: gradient,
        borderRadius: 3,
        color: "white",
        p: 3,
        position: "relative",
        overflow: "hidden",
        minHeight: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Decorative Circle - static, no hover animation */}
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />

      {/* Content */}
      <Box sx={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              opacity: 0.9,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ fontWeight: 700, mt: 1, letterSpacing: '-0.5px' }}
          >
            {value}
          </Typography>
        </Box>
        {icon && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)' }}>
            {icon}
          </Box>
        )}
      </Box>

      {change && (
        <Box sx={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isPositive ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {change}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
