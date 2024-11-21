"use client";

import React, { useContext } from "react";
import {
  DateRangePicker,
  RangeValue,
  DateValue,
} from "@nextui-org/react";
import { mobileContext } from "./contextStore";
import { parseDateTime } from "@internationalized/date";


export const getDefaultDateRange = (isAllDay: boolean) => {
  const today = new Date();

  if (isAllDay) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      start: parseDateTime(today.toISOString().split('T')[0]),
      end: parseDateTime(tomorrow.toISOString().split('T')[0]),
    };
  } else {
    const currentHour = new Date(today);
    const nextHour = new Date(today);
    nextHour.setHours(today.getHours() + 1);
    return {
      start: parseDateTime(currentHour.toISOString().split('T')[0]),
      end: parseDateTime(nextHour.toISOString().split('T')[0]),
    };
  }
};

interface EventDatePickerProps {
  isAllDay: boolean;
  onChange: (start: Date | string, end: Date | string) => void;
  setDateError: React.Dispatch<React.SetStateAction<boolean>>;
}

const EventDatePicker: React.FC<EventDatePickerProps> = ({
  isAllDay,
  onChange,
  setDateError,
}) => {
  const { isMobile } = useContext(mobileContext) as any;

  const handleDateRangeChange = (value: RangeValue<DateValue>) => {
    if (value?.start && value?.end) {
      let startDate: string, endDate: string;

      if (isAllDay) {
        startDate = `${value.start.toString().split('T')[0]}T00:00:00`;
        endDate = `${value.end.toString().split('T')[0]}T23:59:59`;
      } else {
        startDate = value.start.toString();
        endDate = value.end.toString();
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (startDateObj > endDateObj) {
        setDateError(true);
        return;
      } else {
        setDateError(false);
        onChange(startDate, endDate);
      }
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

