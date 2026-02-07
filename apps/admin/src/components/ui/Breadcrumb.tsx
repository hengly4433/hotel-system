"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Breadcrumbs as MuiBreadcrumbs, Typography, alpha } from "@mui/material";
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from "@mui/icons-material";
import { tokens } from "@/lib/theme";

// Route to label mapping
const ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  reservations: "Reservations",
  new: "New Reservation",
  rooms: "Rooms",
  "room-types": "Room Types",
  "room-board": "Room Board",
  availability: "Availability",
  finance: "Finance",
  "folios-payments": "Folios & Payments",
  guests: "Guests",
  pricing: "Pricing",
  reports: "Reports",
  operations: "Operations",
  content: "Content",
  blogs: "Blogs",
  sections: "Section Content",
  settings: "Settings",
  users: "Users",
  roles: "Roles",
  system: "System",
};

// Dynamic route patterns that should show specific labels
const DYNAMIC_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^[0-9a-f]{8}-[0-9a-f]{4}/, label: "Details" },
];

function getLabel(segment: string): string {
  // Check if it's a known route
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment];
  }

  // Check dynamic patterns (like UUIDs)
  for (const { pattern, label } of DYNAMIC_PATTERNS) {
    if (pattern.test(segment)) {
      return label;
    }
  }

  // Convert kebab-case or camelCase to Title Case
  return segment
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname();

  // Split pathname and filter empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items with paths
  const items = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label = getLabel(segment);
    const isLast = index === segments.length - 1;

    return { segment, path, label, isLast };
  });

  // Don't show breadcrumb on dashboard
  if (items.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: tokens.colors.grey[400] }} />}
        sx={{
          "& .MuiBreadcrumbs-li": {
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        {/* Home icon link */}
        <Link href="/admin" style={{ display: "flex", alignItems: "center" }}>
          <HomeIcon
            sx={{
              fontSize: 18,
              color: tokens.colors.grey[500],
              transition: `color ${tokens.transitions.fast}`,
              "&:hover": {
                color: tokens.colors.primary.main,
              },
            }}
          />
        </Link>

        {items.slice(1).map((item) =>
          item.isLast ? (
            <Typography
              key={item.path}
              variant="body2"
              sx={{
                color: tokens.colors.grey[700],
                fontWeight: 500,
              }}
            >
              {item.label}
            </Typography>
          ) : (
            <Link key={item.path} href={item.path}>
              <Typography
                variant="body2"
                sx={{
                  color: tokens.colors.grey[500],
                  fontWeight: 500,
                  transition: `color ${tokens.transitions.fast}`,
                  "&:hover": {
                    color: tokens.colors.primary.main,
                  },
                }}
              >
                {item.label}
              </Typography>
            </Link>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  );
}
