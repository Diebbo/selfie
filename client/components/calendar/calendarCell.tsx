"use client";

import React from "react";
import { Card, CardBody, Badge } from "@nextui-org/react";
import { SelfieEvent } from "@/helpers/types";

const areSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getEventsByDay = (events: SelfieEvent[], date: Date): SelfieEvent[] => {
  if (!Array.isArray(events) || !date || !(date instanceof Date)) {
    throw new Error("Input non valido");
  }

  return events.filter((event) => {
    const eventDate = new Date(event.dtstart);
    return areSameDay(eventDate, date);
  });
};

const showEvents = (events: SelfieEvent[], date: Date): JSX.Element[] => {
  const todayEvents = getEventsByDay(events, date);
  return todayEvents.map((event, index) => (
    <button
      key={index}
      className="rounded-[100px] py-2 px-4 border-1 border-black bg-slate-700 text-left text-white w-full overflow-hidden truncate dark:hover:border-1 dark:hover:border-white"
    >
      {event.title}
    </button>
  ));
};

interface CalendarCellProps {
  day: number;
  date: Date;
  isToday: boolean;
  events?: SelfieEvent[];
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  day,
  date,
  isToday,
  events = [],
}) => {
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);

  return (
    <Card>
      <CardBody className="p-0 flex flex-col bg-white dark:bg-black">
        <div
          className={`p-2 px-4 text-right rounded-[100px] bg-slate-800 text-sm font-bold ${isToday ? "text-slate-300 bg-blue-800 border-2 border-slate-300" : "text-white dark:text-white"}`}
        >
          {day}
        </div>
        <div className="mt-1 space-y-1 overflow-hidden ">
          {showEvents(events, cellDate)}
        </div>
      </CardBody>
    </Card>
  );
};

export default CalendarCell;
