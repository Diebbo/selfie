"use client";

import React, { useContext } from "react";
import {
  DateRangePicker,
  RangeValue,
  DateValue,
} from "@nextui-org/react";
import { mobileContext } from "./contextStore";
import { getLocalTimeZone, parseAbsoluteToLocal, parseDateTime, TimeFields } from "@internationalized/date";


export const getDefaultDateRange = (isAllDay: boolean) => {
  const today = new Date();

  if (isAllDay) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      start: parseAbsoluteToLocal(today.toISOString()),
      end: parseAbsoluteToLocal(tomorrow.toISOString()),
    };
  } else {
    const currentHour = new Date(today);
    const nextHour = new Date(today);
    nextHour.setHours(today.getHours());
    console.log(parseAbsoluteToLocal(currentHour.toISOString()));
    return {
      start: parseAbsoluteToLocal(currentHour.toISOString()),
      end: parseAbsoluteToLocal(nextHour.toISOString()),
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
      const start: TimeFields = { hour: 0, minute: 0 };
      const end: TimeFields = { hour: 23, minute: 59 };
      console.log("inizio e fine", start, end);
      const zone = getLocalTimeZone();

      var startDate = value.start.toDate(zone);
      var endDate = value.end.toDate(zone);
      if (isAllDay) {
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
      }
      console.log("ma questo sono sapotite", startDate, endDate);


      if (startDate.getTime() > endDate.getTime()) {
        setDateError(true);
        return;
      } else {
        setDateError(false);
        onChange(startDate, endDate);
        return;
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

