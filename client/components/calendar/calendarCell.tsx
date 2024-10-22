"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";
import ShowEvent from "./showEvent";
import { SelfieEvent } from "@/helpers/types";

const areSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isAM = (date: Date): boolean => {
  return date.getHours() < 12;
};

const getEventsByDay = (
  events: SelfieEvent[] | undefined,
  date: Date,
): SelfieEvent[] => {
  if (!Array.isArray(events)) {
    return [];
  }

  const filteredEvents = events.filter((event) => {
    const eventDateStart = new Date(event.dtstart);
    const eventDateEnd = new Date(event.dtend);
    return (
      (date.getTime() <= eventDateEnd.getTime() && date.getTime() >= eventDateStart.getTime()
      ) || (
        areSameDay(date, eventDateStart)))
      ?
      true : false;
  });

  // Sort events by AM/PM first, then by time
  return filteredEvents.sort((a, b) => {
    const dateA = new Date(a.dtstart);
    const dateB = new Date(b.dtstart);

    // Compare AM/PM first
    const aIsAM = isAM(dateA);
    const bIsAM = isAM(dateB);

    if (aIsAM && !bIsAM) return -1;
    if (!aIsAM && bIsAM) return 1;

    // If both are AM or both are PM, sort by time
    return dateA.getTime() - dateB.getTime();
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};

const showEvents = (
  events: SelfieEvent[] | undefined,
  date: Date,
  handleOpen: (event: SelfieEvent) => void,
  isMobile: boolean
): JSX.Element[] => {
  const todayEvents = getEventsByDay(events, date);
  const eventsToShow = todayEvents.slice(0, 2);

  return eventsToShow.map((event, index) => (
    <button
      onClick={() => handleOpen(event)}
      key={index}
      className="rounded-[100px] p-1 px-2 border-1 border-black bg-slate-700 text-left text-white w-full overflow-hidden truncate dark:hover:border-1 dark:hover:border-white"
    >
      {!isMobile && (
        <>
          <span className="font-medium">
            {new Date(event.dtstart).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {" - "}
        </>
      )}
      {event.title}
    </button>
  ));
};

const monthNames = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

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
  const [selectedEvents, setSelectedEvents] = useState<SelfieEvent | null>(null);
  const [isOpenSE, setIsOpenSE] = useState(false);
  const [isAllEventsOpen, setIsAllEventsOpen] = useState(false);
  const isMobile = useIsMobile();
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const todayEvents = getEventsByDay(safeEvents, cellDate);
  const hasMoreEvents = todayEvents.length > 2;

  const handleClose = () => {
    setSelectedEvents(null);
    setIsOpenSE(false);
  };

  const handleOpen = (e: SelfieEvent) => {
    console.log(e);
    setSelectedEvents(e);
    setIsOpenSE(true);
  };

  const formatEventTime = (event: SelfieEvent) => {
    const eventDate = new Date(event.dtstart);
    const timeString = eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return `${timeString}`;
  };

  return (
    <Card>
      <CardBody className="p-0 flex flex-col bg-white dark:bg-black">
        <Button
          onClick={() => setIsAllEventsOpen(true)}
          className={`justify-end rounded-[100px] text-sm font-bold ${isToday ? "text-slate-200 bg-[#9353d3] border-2 border-slate-300" : "bg-slate-800 text-white dark:text-white"}`}
        >
          {day}
        </Button>
        <div className="mt-1 space-y-1 text-xs overflow-hidden">
          {showEvents(safeEvents, cellDate, handleOpen, isMobile)}
          {hasMoreEvents && (
            <Button
              className="h-fit w-full rounded-[100px] bg-primary text-white border-2 border-transparent hover:border-white"
              onClick={() => setIsAllEventsOpen(true)}
            >
              ...
            </Button>
          )}
        </div>
      </CardBody>

      <ShowEvent
        isOpen={isOpenSE}
        onClose={handleClose}
        selectedEvent={selectedEvents}
      />

      <Modal
        isOpen={isAllEventsOpen}
        onClose={() => setIsAllEventsOpen(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Eventi del {day} {monthNames[date.getMonth()]} </ModalHeader>
          <ModalBody className="p-4">
            <div className="space-y-3">
              {todayEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg border-2 hover:border-secondary cursor-pointer"
                  onClick={() => {
                    handleOpen(event);
                    setIsAllEventsOpen(false);
                  }}
                >
                  <p className="font-medium">
                    <span className="text-primary">
                      {formatEventTime(event)}
                    </span>
                    {" - "}
                    {event.title.toString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(new Date(event.dtstart))}
                  </p>
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default CalendarCell;
