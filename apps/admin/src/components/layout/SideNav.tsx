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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  ReceiptLong as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Circle as CircleIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { apiJson as api } from "@/lib/api/client";
import type { NavigationMenu } from "@/lib/types/rbac";

const DRAWER_WIDTH = 260;

// Map menu keys to icons
const ICONS: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  reservations: <HotelIcon />, // closest to generic hotel
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

  // No early return for loading to keep Sidebar visible

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
          boxShadow: "4px 0 24px rgba(0,0,0,0.02)", // Subtle depth sidebar
        },
      }}
    >
      <Box sx={{ p: 3, pb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
         <Box sx={{
             width: 40, height: 40, borderRadius: '12px',
             background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', // Sky blue gradient
             display: 'flex', alignItems: 'center', justifyContent: 'center', 
             color: 'white', fontWeight: 800, fontSize: '1.2rem',
             boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)'
         }}>S</Box>
        <Typography variant="h6" sx={{ 
            fontWeight: 800, 
            background: 'linear-gradient(45deg, #0f172a, #0ea5e9)', // Dark slate to sky blue
            backgroundClip: 'text',
            textFillColor: 'transparent',
            letterSpacing: '-0.5px'
        }}>
          Sky High Hotel
        </Typography>
      </Box>

       <List component="nav" sx={{ px: 2 }}>
        {loading ? (
          // Loading Skeleton
          Array.from(new Array(5)).map((_, index) => (
             <Box key={index} sx={{ mb: 1, px: 0 }}>
               <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)' }} />
             </Box>
          ))
        ) : (
          menus.map((menu) => {
           const hasSub = menu.submenus && menu.submenus.length > 0;
           const isOpen = openSub[menu.key] ?? false; 
           const Icon = ICONS[menu.key] || <CircleIcon />;

           if (menu.key === 'dashboard') {
             const active = pathname === '/admin' || pathname === '/admin/';
             const activeColor = "#0284c7"; // Sky Blue 600
             const activeBg = "#e0f2fe";    // Sky Blue 100
             return (
               <ListItemButton
                 key={menu.key}
                 component={Link}
                 href="/admin"
                 sx={{ 
                     borderRadius: 3, 
                     mb: 1, 
                     py: 1.2,
                     color: active ? activeColor : "text.secondary",
                     bgcolor: active ? activeBg : "transparent",
                     "&:hover": { bgcolor: active ? activeBg : "#f8fafc", color: activeColor }
                 }}
               >
                 <ListItemIcon sx={{ minWidth: 44, color: active ? activeColor : "inherit" }}>
                   {Icon}
                 </ListItemIcon>
                 <ListItemText 
                    primary={menu.label} 
                    primaryTypographyProps={{ 
                        fontWeight: active ? 700 : 500, 
                        fontSize: '0.95rem'
                    }} 
                 />
               </ListItemButton>
             );
           }

           const isAnyChildActive = menu.submenus?.some(sub => pathname === sub.route);
           const activeColor = "#0284c7";
           const activeBg = "#e0f2fe";

           return (
            <div key={menu.key}>
              <ListItemButton 
                onClick={() => handleClick(menu.key)} 
                sx={{ 
                    borderRadius: 3, 
                    mb: 1,
                    py: 1.2,
                    color: isAnyChildActive ? activeColor : "text.secondary",
                    bgcolor: isAnyChildActive && !isOpen ? activeBg : "transparent", // Highlight parent if child active and closed
                    "&:hover": { bgcolor: "#f8fafc", color: activeColor }
                 }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: isAnyChildActive ? activeColor : "inherit" }}>
                  {Icon}
                </ListItemIcon>
                <ListItemText 
                    primary={menu.label} 
                    primaryTypographyProps={{ 
                        fontWeight: isAnyChildActive ? 700 : 500,
                        fontSize: '0.95rem'
                    }} 
                />
                {hasSub ? (isOpen ? <ExpandLess sx={{ opacity: 0.7 }} /> : <ExpandMore sx={{ opacity: 0.7 }} />) : null}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ position: 'relative' }}>
                    {/* Vertical line indicator for submenu group */}
                    <Box sx={{
                        position: 'absolute',
                        left: 24,
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        bgcolor: '#e2e8f0',
                        zIndex: 0
                    }} />
                  
                  {menu.submenus.map((sub) => {
                    const active = pathname === sub.route;
                    return (
                      <ListItemButton
                        key={sub.key}
                        component={Link}
                        href={sub.route}
                        sx={{
                          pl: 6.5, // Indent for hierarchy
                          pr: 2,
                          py: 1,
                          mb: 0.5,
                          borderRadius: 2,
                          position: 'relative',
                          zIndex: 1,
                          color: active ? activeColor : "text.secondary",
                          bgcolor: active ? "transparent" : "transparent",
                          "&:hover": { color: "#0ea5e9" },
                        }}
                      >
                         {/* Dot for active state */}
                         {active && (
                             <Box sx={{
                                 position: 'absolute',
                                 left: 21,
                                 width: 8,
                                 height: 8,
                                 borderRadius: '50%',
                                 bgcolor: '#0ea5e9',
                                 boxShadow: '0 0 0 2px white'
                             }} />
                         )}
                         <ListItemText 
                            primary={sub.label} 
                            primaryTypographyProps={{ 
                                fontSize: "0.875rem", 
                                fontWeight: active ? 600 : 500 
                            }} 
                         />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </div>
           );
        })
        )}
      </List>
    </Drawer>
  );
}
