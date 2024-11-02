"use client";

import React, { useState, useContext } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";
import { SelfieEvent } from "@/helpers/types";
import { useRouter } from 'next/navigation';
import { WeekViewGrid } from './weekViewGrid';
import { mobileContext } from "./contextStore"

// Utility Functions
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

const getEventsByDay = (events: SelfieEvent[] | undefined, date: Date): SelfieEvent[] => {
  if (!Array.isArray(events)) return [];

  const filteredEvents = events.filter((event) => {
    const eventDateStart = new Date(event.dtstart);
    const eventDateEnd = new Date(event.dtend);
    return (
      (date.getTime() <= eventDateEnd.getTime() && date.getTime() >= eventDateStart.getTime()) ||
      areSameDay(date, eventDateStart)
    );
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

const formatEventTime = (event: SelfieEvent): string => {
  const eventDate = new Date(event.dtstart);
  return eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

// Event Display Component
const EventsList = ({ events, date, handleClick, isMonthView }: {
  events: SelfieEvent[] | undefined,
  date: Date,
  handleClick: (event: SelfieEvent) => void,
  isMonthView: boolean,
}): JSX.Element | null => {
  const todayEvents = getEventsByDay(events, date);
  const eventsToShow = isMonthView ? todayEvents.slice(0, 2) : todayEvents;
  const { isMobile, setIsMobile } = useContext(mobileContext) as any;

  const handleColor = (event: SelfieEvent): string => {
    //se accedo a event.participants.length si rompe tutto boh?!
    //chiedere a claude
    console.log("ma??", event.dtstart, event.participants);
    if (event.allDay)
      return "bg-primary-200 text-primary-700 hover:border-success-700";
    return "bg-danger-100 text-danger-700 hover:border-danger-700";
  }

  return (
    <>
      {eventsToShow.map((event, index) => (
        <button
          onClick={() => handleClick(event)}
          key={index}
          className={`rounded-[100px] p-1 px-2 border-1 border-slate-300 text-left w-full overflow-hidden truncate dark:hover:border-1 ${handleColor(event)}`}
        >
          {(!isMobile && !event.allDay) && (
            <>
              <span className="font-medium">{formatEventTime(event)}</span>
              {" - "}
            </>
          )}
          {event.title}
        </button>
      ))}
    </>
  );
};

const monthNames = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

// Main Component
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
  events = []
}) => {
  const [isAllEventsOpen, setIsAllEventsOpen] = useState(false);
  const router = useRouter();
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const todayEvents = getEventsByDay(safeEvents, cellDate);
  const hasMoreEvents = todayEvents.length > 2;
  const hasEvents = todayEvents.length > 0;
  const { isMobile, setIsMobile } = useContext(mobileContext) as any;

  const handleClick = (e: SelfieEvent) => {
    router.push(`/calendar/${e._id}`);
  };

  // Shared button styles
  const dayButtonClass = isToday
    ? "text-slate-200 bg-[#9353d3] border-2 border-slate-300"
    : "bg-slate-800 text-white dark:text-white";

  // Modal Component
  const EventsModal = () => (
    <Modal isOpen={isAllEventsOpen} onClose={() => setIsAllEventsOpen(false)} size="md">
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
  );

  // Week View
  if (!isMonthView) {
    return (
      <div aria-label="weekView" className={`h-full w-full rounded-[20px] ${isToday ? 'bg-blue-50 dark:bg-slate-900' : ''}`}>
        <style jsx global>{`
      button.calendar-button {
        min-width: 2rem !important;
      }
    `}</style>

        {!isMobile ? (
          <Button
            onClick={() => setIsAllEventsOpen(true)}
            className={`justify-center w-full rounded-[100px] text-sm font-bold ${dayButtonClass}`}
          >
            {day}
          </Button>
        ) : (


          <Button
            onClick={() => setIsAllEventsOpen(true)}
            className={`justify-center w-[calc(82vw/7)] h-10 rounded-full p-0 ${dayButtonClass}`}
          >
            {day}
          </Button>
        )}
        <WeekViewGrid
          date={date}
          events={events}
          isMobile={isMobile}
        />
        <EventsModal />
      </div>
    );
  }

  // Month View
  return (
    <div aria-label="monthView" className={isMobile ? "w-[calc(87vw/7)] h-[calc(87vw/7)] flex flex-col items-center" : "w-full"}>
      {!isMobile ? (
        <div className="w-full">
          <Button
            onClick={() => setIsAllEventsOpen(true)}
            className={`justify-start w-full rounded-[100px] text-sm font-bold ${dayButtonClass}`}
          >
            {day}
          </Button>
          <div className="mt-1 space-y-1 text-xs overflow-hidden">
            <EventsList
              events={safeEvents}
              date={cellDate}
              handleClick={handleClick}
              isMonthView={isMonthView}
            />
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
      ) : (
        <div className="flex flex-col items-center">
          <Button
            className={`w-10 h-10 min-w-0 rounded-full p-0 ${dayButtonClass}`}
            onClick={() => setIsAllEventsOpen(true)}
          >
            {day}
          </Button>
          {hasEvents && (
            <div className="mt-[0.5rem] w-3 h-3 rounded-full bg-sky-300 mt-1" />
          )}
        </div>
      )}
      <EventsModal />
    </div>
  );
};

export default CalendarCell;
