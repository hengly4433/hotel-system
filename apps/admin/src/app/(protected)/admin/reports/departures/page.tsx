"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import ReportFilter from "@/components/reports/ReportFilter";
import DeparturesReport from "@/components/reports/DeparturesReport";
import { format } from "date-fns";

export default function DeparturesPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <main>
      <PageHeader title="Daily Departures" subtitle="Guests departing today" />
      <Stack spacing={3}>
        <ReportFilter
          fromDate={date}
          onFromDateChange={setDate}
          hideEndDate
        />
        <DeparturesReport
          date={date ? new Date(date) : null}
        />
      </Stack>
    </main>
  );
}
