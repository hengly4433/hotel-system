"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  ReceiptLong as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandMore,
  Circle as CircleIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { apiJson as api } from "@/lib/api/client";
import type { NavigationMenu } from "@/lib/types/rbac";
import { tokens } from "@/lib/theme";

const DRAWER_WIDTH = 260;

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  reservations: <HotelIcon />,
  rooms: <HotelIcon />,
  finance: <ReceiptIcon />,
  guests: <PeopleIcon />,
  settings: <SettingsIcon />,
  reports: <AssessmentIcon />,
};

export default function SideNav() {
  const pathname = usePathname();
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSub, setOpenSub] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api<NavigationMenu[]>("/me/navigation");
        if (active) setMenus(data);
      } catch (err) {
        console.error("Nav load error", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const handleClick = (key: string) => {
    setOpenSub((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeColor = tokens.colors.primary.main;
  const activeBg = alpha(tokens.colors.primary.main, 0.08);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          border: "none",
          backgroundColor: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo Section - Fixed Header */}
      <Box 
        sx={{ 
          p: 3, 
          pb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: `1px solid ${tokens.colors.grey[100]}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{
          width: 44, 
          height: 44, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          fontWeight: 800, 
          fontSize: '1.3rem',
        }}>
          S
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.grey[900], letterSpacing: '-0.5px' }}>
            Sky High
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.grey[500], fontWeight: 500, letterSpacing: '0.5px' }}>
            HOTEL ADMIN
          </Typography>
        </Box>
      </Box>

      {/* Scrollable Menu Container */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: tokens.colors.grey[300],
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: tokens.colors.grey[400],
          },
        }}
      >
        <List component="nav" sx={{ px: 2, pt: 2 }}>
        {loading ? (
          Array.from(new Array(5)).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={46} sx={{ borderRadius: 2, mb: 1 }} />
          ))
        ) : (
          menus
            // Hide RBAC menu from sidebar - pages still accessible via direct URL
            .filter((menu) => menu.key !== 'rbac')
            .map((menu) => {
            const hasSub = menu.submenus && menu.submenus.length > 0;
            const isOpen = openSub[menu.key] ?? false; 
            const Icon = ICONS[menu.key] || <CircleIcon />;

            if (menu.key === 'dashboard') {
              const active = pathname === '/admin' || pathname === '/admin/';
              return (
                <ListItemButton
                  key={menu.key}
                  component={Link}
                  href="/admin"
                  sx={{ 
                    borderRadius: 2, 
                    mb: 0.5, 
                    py: 1.25,
                    px: 2,
                    color: active ? activeColor : tokens.colors.grey[600],
                    bgcolor: active ? activeBg : "transparent",
                    "&:hover": { bgcolor: activeBg }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: active ? activeColor : "inherit" }}>
                    {Icon}
                  </ListItemIcon>
                  <ListItemText primary={menu.label} primaryTypographyProps={{ fontWeight: active ? 600 : 500, fontSize: '0.9rem' }} />
                </ListItemButton>
              );
            }

            const isAnyChildActive = menu.submenus?.some(sub => pathname === sub.route);

            return (
              <Box key={menu.key}>
                <ListItemButton 
                  onClick={() => handleClick(menu.key)} 
                  sx={{ 
                    borderRadius: 2, 
                    mb: 0.5,
                    py: 1.25,
                    px: 2,
                    color: isAnyChildActive ? activeColor : tokens.colors.grey[600],
                    bgcolor: isAnyChildActive && !isOpen ? activeBg : "transparent",
                    "&:hover": { bgcolor: alpha(tokens.colors.primary.main, 0.04) }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isAnyChildActive ? activeColor : "inherit" }}>
                    {Icon}
                  </ListItemIcon>
                  <ListItemText primary={menu.label} primaryTypographyProps={{ fontWeight: isAnyChildActive ? 600 : 500, fontSize: '0.9rem' }} />
                  {hasSub && (
                    <ExpandMore 
                      fontSize="small" 
                      sx={{ 
                        color: tokens.colors.grey[400],
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                      }} 
                    />
                  )}
                </ListItemButton>

                <Collapse in={isOpen} timeout={150}>
                  <List component="div" disablePadding sx={{ ml: 2 }}>
                    {menu.submenus.map((sub) => {
                      const active = pathname === sub.route;
                      return (
                        <ListItemButton
                          key={sub.key}
                          component={Link}
                          href={sub.route}
                          sx={{
                            pl: 5,
                            py: 0.75,
                            mb: 0.25,
                            borderRadius: 2,
                            color: active ? activeColor : tokens.colors.grey[600],
                            "&:hover": { color: activeColor, bgcolor: alpha(tokens.colors.primary.main, 0.04) },
                          }}
                        >
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: active ? activeColor : tokens.colors.grey[300],
                            mr: 2,
                          }} />
                          <ListItemText primary={sub.label} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: active ? 600 : 500 }} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })
        )}
        </List>
      </Box>
    </Drawer>
  );
}
