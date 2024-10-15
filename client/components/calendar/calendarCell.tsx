"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import ShowEvent from './showEvent'
import { SelfieEvent } from "@/helpers/types";

const areSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getEventsByDay = (
  events: SelfieEvent[] | undefined,
  date: Date,
): SelfieEvent[] => {
  if (!Array.isArray(events)) {
    return []; // Restituisci un array vuoto invece di lanciare un errore
  }

  return events.filter((event) => {
    const eventDate = new Date(event.dtstart);
    return areSameDay(eventDate, date);
  });
};

const showEvents = (
  events: SelfieEvent[] | undefined,
  date: Date,
  handleOpen: (event: SelfieEvent) => void,
): JSX.Element[] => {
  const todayEvents = getEventsByDay(events, date);
  return todayEvents.map((event, index) => (
    <button
      onClick={() => handleOpen(event)}
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
  events = [], // Questo già fornisce un default, ma assicuriamoci che sia un array
}) => {
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const [selectedEvents, setSelectedEvents] = useState<SelfieEvent | null>(null)
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setSelectedEvents(null);
    setIsOpen(false);
  };

  const handleOpen = (e: SelfieEvent) => {
    setSelectedEvents(e);
    setIsOpen(true);
  };

  return (
    <Card>
      <CardBody className="p-0 flex flex-col bg-white dark:bg-black">
        <div
          className={`p-2 px-4 text-right rounded-[100px] bg-slate-800 text-sm font-bold ${isToday ? "text-slate-300 bg-blue-800 border-2 border-slate-300" : "text-white dark:text-white"}`}
        >
          {day}
        </div>
        <div className="mt-1 space-y-1 overflow-hidden ">
          {showEvents(safeEvents, cellDate, handleOpen)}
        </div>
      </CardBody>
      <ShowEvent
        isOpen={isOpen}
        onClose={handleClose}
        selectedEvent={selectedEvents}
      />
    </Card>


  );
};

export default CalendarCell;
