"use client";

import React from "react";
import {
  DateRangePicker,
  RangeValue,
  DateValue,
} from "@nextui-org/react";

interface EventDatePickerProps {
  isAllDay: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onChange: (start: Date | string, end: Date | string) => void;
}

const EventDatePicker: React.FC<EventDatePickerProps> = ({
  isAllDay,
  onChange,
}) => {
  const handleDateRangeChange = (value: RangeValue<DateValue>) => {
    if (value?.start && value?.end) {
      onChange(value.start.toString(), value.end.toString());
    }
  };

  return (
    <DateRangePicker
      label="Event duration"
      className="max-w-[430px]"
      isRequired
      hideTimeZone
      visibleMonths={2}
      onChange={handleDateRangeChange}
      granularity={isAllDay ? "day" : "minute"}
    />
  );
};

export default EventDatePicker;
