"use client";

import { Stack } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import HousekeepingReport from "@/components/reports/HousekeepingReport";

export default function HousekeepingPage() {
  return (
    <main>
      <PageHeader title="Housekeeping Status" subtitle="Room cleaning status" />
      <Stack spacing={3}>
        <HousekeepingReport />
      </Stack>
    </main>
  );
}
