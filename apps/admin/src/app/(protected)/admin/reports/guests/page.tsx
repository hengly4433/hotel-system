"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import ReportFilter from "@/components/reports/ReportFilter";
import GuestsInHouseReport from "@/components/reports/GuestsInHouseReport";
import { format } from "date-fns";

export default function GuestsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <main>
      <PageHeader title="Guests In-House" subtitle="Current guest list" />
      <Stack spacing={3}>
        <ReportFilter
          fromDate={date}
          onFromDateChange={setDate}
          hideEndDate
        />
        <GuestsInHouseReport
          date={date ? new Date(date) : null}
        />
      </Stack>
    </main>
  );
}
