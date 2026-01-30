"use client";

import * as React from "react";
import { Card, Box, Typography } from "@mui/material";

interface GradientCardProps {
  title: string;
  value: string;
  change: string;
  icon?: React.ReactNode;
  gradient: string;
  circleColor?: string;
}

export function GradientCard({ title, value, change, gradient, circleColor = "rgba(255,255,255,0.2)" }: GradientCardProps) {
  return (
    <Card
      sx={{
        background: gradient,
        borderRadius: "12px",
        color: "white",
        p: 3,
        position: "relative",
        overflow: "hidden",
        minHeight: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Decorative Circles */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: circleColor,
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -40,
          right: 40,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: circleColor,
          zIndex: 1,
        }}
      />

      <Box sx={{ zIndex: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "normal", opacity: 0.9 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
          {value}
        </Typography>
      </Box>

      <Box sx={{ zIndex: 2 }}>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {change}
        </Typography>
      </Box>
    </Card>
  );
}
