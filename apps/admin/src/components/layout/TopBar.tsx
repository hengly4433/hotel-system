"use client";

import { useRouter } from "next/navigation";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Box, 
  Badge,
  Divider,
  Tooltip,
  alpha,
  InputBase,
} from "@mui/material";
import { 
  Notifications, 
  Mail, 
  Menu as MenuIcon,
  Search as SearchIcon,
  Logout,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

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
        bgcolor: "#fff",
        borderBottom: `1px solid ${tokens.colors.grey[200]}`,
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton 
          edge="start" 
          color="inherit" 
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Bar */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            bgcolor: tokens.colors.grey[100],
            borderRadius: 2,
            px: 2,
            py: 0.75,
            flex: 1,
            maxWidth: 400,
          }}
        >
          <SearchIcon sx={{ color: tokens.colors.grey[400], mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Search..."
            sx={{
              flex: 1,
              fontSize: '0.875rem',
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              bgcolor: tokens.colors.grey[200],
              color: tokens.colors.grey[600],
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          >
            ⌘K
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Notification Icons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Messages">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="success">
                <Mail sx={{ color: tokens.colors.grey[600] }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="warning">
                <Notifications sx={{ color: tokens.colors.grey[600] }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: tokens.colors.grey[200] }} />

        {/* User Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              David Grey
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.grey[500] }}>
              Administrator
            </Typography>
          </Box>
          <Avatar
            src="/assets/faces/face1.jpg"
            alt="David Grey"
            sx={{ width: 38, height: 38 }}
          />
          <Tooltip title="Logout">
            <IconButton 
              size="small" 
              onClick={handleLogout}
              sx={{ color: tokens.colors.grey[500] }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
