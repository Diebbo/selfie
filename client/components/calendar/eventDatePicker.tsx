"use client";

import React, { useContext } from "react";
import {
  DateRangePicker,
  RangeValue,
  DateValue,
} from "@nextui-org/react";
import { mobileContext } from "./reloadContext"

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
  const { isMobile, setIsMobile } = useContext(mobileContext) as any;

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
      visibleMonths={isMobile ? 1 : 2}
      onChange={handleDateRangeChange}
      granularity={isAllDay ? "day" : "minute"}
    />
  );
};

export default EventDatePicker;
