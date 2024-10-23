"use client";

import React, { useContext } from "react";
import {
  DateRangePicker,
  RangeValue,
  DateValue,
} from "@nextui-org/react";
import { mobileContext } from "./reloadContext"
import { parseDateTime } from "@internationalized/date";

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

  const getDefaultDateRange = (isAllDay: boolean) => {
    const today = new Date();

    if (isAllDay) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        start: parseDateTime(today.toISOString().split('T')[0]),
        end: parseDateTime(tomorrow.toISOString().split('T')[0])
      };
    } else {
      const nextHour = new Date(today);
      nextHour.setHours(today.getHours() + 1);
      return {
        start: parseDateTime(today.toISOString().split('T')[0]),
        end: parseDateTime(nextHour.toISOString().split('T')[0])
      };
    }
  };

  return (
    <DateRangePicker
      label="Event duration"
      className={`${isMobile
        ? "w-full max-w-[95vw] mx-auto flex flex-col space-y-2 overflow-hidden"
        : "max-w-[430px] flex flex-row space-x-2"
        }`}
      isRequired
      hideTimeZone
      visibleMonths={isMobile ? 1 : 2}
      onChange={handleDateRangeChange}
      granularity={isAllDay ? "day" : "minute"}
      defaultValue={getDefaultDateRange(isAllDay)}
    />


  );
};

export default EventDatePicker;
