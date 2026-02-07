"use client";

import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  alpha,
  Button,
} from "@mui/material";
import {
  People as UsersIcon,
  AdminPanelSettings as RolesIcon,
  Menu as MenusIcon,
  SubdirectoryArrowRight as SubmenusIcon,
  Key as PermissionsIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

const links = [
  { 
    href: "/admin/settings/rbac/users", 
    label: "Users",
    description: "Manage user accounts and role assignments",
    icon: UsersIcon,
    color: tokens.colors.primary.main,
  },
  { 
    href: "/admin/settings/rbac/roles", 
    label: "Roles",
    description: "Define access profiles and assign permissions",
    icon: RolesIcon,
    color: tokens.colors.success.main,
  },
  { 
    href: "/admin/settings/rbac/menus", 
    label: "Menus",
    description: "Configure main navigation sections",
    icon: MenusIcon,
    color: tokens.colors.warning.main,
  },
  { 
    href: "/admin/settings/rbac/submenus", 
    label: "Submenus",
    description: "Configure navigation sub-items",
    icon: SubmenusIcon,
    color: '#8b5cf6',
  },
  { 
    href: "/admin/settings/rbac/permissions", 
    label: "Permissions",
    description: "Define granular access rules",
    icon: PermissionsIcon,
    color: tokens.colors.error.main,
  },
];

export default function RbacHomePage() {
  return (
    <Box component="main">
      <PageHeader 
        title="Access Control" 
        subtitle="Manage users, roles, and permissions for your system" 
      />

      <Stack spacing={2}>
        {links.map((link) => {
          const IconComponent = link.icon;
          return (
            <Card
              key={link.href}
              component={Link}
              href={link.href}
              sx={{
                textDecoration: 'none',
                borderRadius: 3,
                boxShadow: 'none',
                border: `1px solid ${tokens.colors.grey[200]}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: alpha(link.color, 0.4),
                  boxShadow: `0 4px 20px ${alpha(link.color, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 3,
                        bgcolor: alpha(link.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 26, color: link.color }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {link.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {link.description}
                      </Typography>
                    </Box>
                  </Box>
                  <ArrowIcon sx={{ color: tokens.colors.grey[400] }} />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
