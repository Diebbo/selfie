"use client";

import React from "react";
import { DatePicker, DateRangePicker } from "@nextui-org/react";
import { parseZonedDateTime } from "@internationalized/date";

const EventDatePicker = (value: boolean) => {
  return value ? (
    <div className="flex flex-row gap-4 min-w-[430px]">
      <DatePicker label="Start date" isRequired />
      <DatePicker label="End date" isRequired />
    </div>
  ) : (
    <DateRangePicker
      label="Event duration"
      className="max-w-[430px]"
      isRequired
      hideTimeZone
      visibleMonths={2}
      defaultValue={{
        start: parseZonedDateTime("2024-04-01T00:45[America/Los_Angeles]"),
        end: parseZonedDateTime("2024-04-08T11:15[America/Los_Angeles]"),
      }}
    />
  );
};

export default EventDatePicker;
