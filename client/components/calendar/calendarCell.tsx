"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";
import { SelfieEvent } from "@/helpers/types";
import { useRouter } from 'next/navigation';
import { WeekViewGrid } from './weekViewGrid';

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

  return filteredEvents.sort((a, b) => {
    const dateA = new Date(a.dtstart);
    const dateB = new Date(b.dtstart);

    const aIsAM = isAM(dateA);
    const bIsAM = isAM(dateB);

    if (aIsAM && !bIsAM) return -1;
    if (!aIsAM && bIsAM) return 1;

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
      setIsMobile(window.innerWidth < 768);
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
  handleClick: (event: SelfieEvent) => void,
  isMobile: boolean,
  isMonthView: boolean,
): JSX.Element[] | null => {
  const todayEvents = getEventsByDay(events, date);
  const eventsToShow = isMonthView ? todayEvents.slice(0, 2) : todayEvents.slice(0, 15);

  const handleColor = (event: SelfieEvent): string => {
    if (event.participants.length > 0 && event.allDay)
      return "bg-warning-300 text-warning-800 hover:border-warning-800"
    else if (event.participants.length > 0)
      return "bg-deafult-300 text-default-700 hover:border-default"
    else if (event.allDay)
      return "bg-success-200 text-success-700 hover:border-success-700";
    else
      return "bg-danger-100 text-danger-700 hover:border-danger-700";
  }

  return (
    !isMobile ? eventsToShow.map((event, index) => (
      <button
        onClick={() => handleClick(event)}
        key={index}
        className={`rounded-[100px] p-1 px-2 border-1 border-slate-300  text-left w-full overflow-hidden truncate dark:hover:border-1  ${handleColor(event)}`}
      >
        {(!isMobile && !event.allDay) && (
          <>
            <span className="font-medium">
              {new Date(event.dtstart).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {" - "}
          </>
        )}
        {event.title}
      </button>
    )) : null
  );
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
  isMonthView: boolean;
  day: number;
  date: Date;
  isToday: boolean;
  events?: SelfieEvent[];
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  isMonthView,
  day,
  date,
  isToday,
  events = [],
}) => {
  const [isAllEventsOpen, setIsAllEventsOpen] = useState(false);
  const isMobile = useIsMobile();
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const todayEvents = getEventsByDay(safeEvents, cellDate);
  const hasMoreEvents = todayEvents.length > 2;
  const router = useRouter();
  const hasEvents = todayEvents.length > 0;
  // const hasProjects = todayProjets.length > 0;
  // const hasTasks = todayTask.lenght > 0;

  const handleClick = (e: SelfieEvent) => {
    router.push(`/calendar/${e._id}`);
  };

  const formatEventTime = (event: SelfieEvent) => {
    const eventDate = new Date(event.dtstart);
    const timeString = eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return `${timeString}`;
  };

  if (!isMonthView) {
    return (
      <div className={`h-full rounded-[20px] ${isToday ? 'bg-blue-50 dark:bg-slate-900' : ''}`}>
        <Button
          onClick={() => setIsAllEventsOpen(true)}
          className={`justify-center w-full rounded-[100px] text-sm font-bold 
            ${isToday ? "text-slate-200 bg-[#9353d3] border-2 border-slate-300" : "bg-slate-800 text-white dark:text-white"}`}
        >
          {day}
        </Button>
        <WeekViewGrid
          date={date}
          events={events}
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <div className={isMobile ? "w-[calc(87vw/7)] h-[calc(87vw/7)] flex flex-col items-center" : "w-full"}>
      {!isMobile && (
        <div className="w-full">
          <Button
            onClick={() => setIsAllEventsOpen(true)}
            className={`justify-start w-full rounded-[100px] text-sm font-bold 
            ${isToday ? "text-slate-200 bg-[#9353d3] border-2 border-slate-300" : "bg-slate-800 text-white dark:text-white"}`}
          >
            {day}
          </Button>
          <div className="mt-1 space-y-1 text-xs overflow-hidden">
            {showEvents(safeEvents, cellDate, handleClick, isMobile, isMonthView)}
            {hasMoreEvents && isMonthView && (
              <Button
                className="h-fit w-full rounded-[100px] bg-primary text-white border-2 border-transparent hover:border-white"
                onClick={() => setIsAllEventsOpen(true)}
              >
                ...
              </Button>
            )}
          </div>
        </div>
      )}

      {isMobile && (
        <div className="flex flex-col items-center">
          <Button
            className={`w-10 h-10 min-w-0 rounded-full p-0 ${isToday ? "bg-[#9353d3] text-slate-200 border-2 border-slate-300" : "bg-slate-600 text-white"
              }`}
            onClick={() => setIsAllEventsOpen(true)}
          >
            {day}
          </Button>
          {hasEvents && (
            <div className="mt-[0.5rem] w-3 h-3 rounded-full bg-sky-300 mt-1" />
          )}
        </div>
      )}

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
                    handleClick(event);
                    setIsAllEventsOpen(false);
                  }}
                >
                  <p className="font-medium">
                    <span className="text-primary">
                      {!event.allDay && formatEventTime(event)}
                    </span>
                    {!event.allDay && " - "}
                    {<b>{event.title.toString()}</b>}
                  </p>
                  <p className="text-sm text-gray-500">
                    {!event.allDay && formatDate(new Date(event.dtstart))}
                    {event.allDay && "Tutto il giorno"}
                  </p>
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CalendarCell;
