"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import ReportFilter from "@/components/reports/ReportFilter";
import ArrivalsReport from "@/components/reports/ArrivalsReport";
import { format } from "date-fns";

export default function ArrivalsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <main>
      <PageHeader title="Daily Arrivals" subtitle="Guests arriving today" />
      <Stack spacing={3}>
        <ReportFilter
          fromDate={date}
          onFromDateChange={setDate}
          hideEndDate
        />
        <ArrivalsReport
          date={date ? new Date(date) : null}
        />
      </Stack>
    </main>
  );
}
