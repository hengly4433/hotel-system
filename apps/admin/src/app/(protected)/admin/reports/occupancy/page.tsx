"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import ReportFilter from "@/components/reports/ReportFilter";
import OccupancyReport from "@/components/reports/OccupancyReport";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function OccupancyPage() {
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  return (
    <main>
      <PageHeader title="Occupancy Report" subtitle="Room utilization statistics" />
      <Stack spacing={3}>
        <ReportFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
        <OccupancyReport
          fromDate={fromDate ? new Date(fromDate) : null}
          toDate={toDate ? new Date(toDate) : null}
        />
      </Stack>
    </main>
  );
}
