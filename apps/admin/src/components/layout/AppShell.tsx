"use client";

import * as React from "react";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import { Box } from "@mui/material";

const DRAWER_WIDTH = 260;

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default", overflow: "hidden" }}>
      <SideNav />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", width: `calc(100% - ${DRAWER_WIDTH}px)`, height: "100vh", overflow: "hidden" }}>
        <TopBar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

