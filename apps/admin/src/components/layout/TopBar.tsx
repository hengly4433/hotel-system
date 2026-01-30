"use client";

import { useRouter } from "next/navigation";
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Badge } from "@mui/material";
import { Notifications, Mail, Menu as MenuIcon } from "@mui/icons-material";

const SIDEBAR_WIDTH = 260;

export default function TopBar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: "1px solid #e0e0e0",
        color: "text.primary",
      }}
    >
      <Toolbar>
        <IconButton edge="start" color="inherit" sx={{ mr: 2, display: { md: "none" } }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton color="inherit" sx={{ mr: 1 }}>
          <Badge badgeContent={4} color="success">
            <Mail color="action" />
          </Badge>
        </IconButton>
        <IconButton color="inherit" sx={{ mr: 2 }}>
          <Badge badgeContent={4} color="warning">
            <Notifications color="action" />
          </Badge>
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={handleLogout}>
          <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 600 }}>
            David Grey
          </Typography>
          <Avatar
            src="/assets/faces/face1.jpg"
            alt="David Grey"
            sx={{ width: 32, height: 32 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
