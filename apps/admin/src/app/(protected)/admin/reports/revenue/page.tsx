"use client";

import { useState } from "react";
import { Stack, Box } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import ReportFilter from "@/components/reports/ReportFilter";
import RevenueReport from "@/components/reports/RevenueReport";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function RevenuePage() {
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  return (
    <main>
      <PageHeader title="Revenue Report" subtitle="Financial performance over time" />
      <Stack spacing={3}>
        <ReportFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
        <RevenueReport
          fromDate={fromDate ? new Date(fromDate) : null}
          toDate={toDate ? new Date(toDate) : null}
        />
      </Stack>
    </main>
  );
}
