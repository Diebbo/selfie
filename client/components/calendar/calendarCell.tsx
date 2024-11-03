"use client";

import React, { useState, useContext } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";
import { SelfieEvent, ProjectModel } from "@/helpers/types";
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

interface CombinedAppointment {
  type: 'event' | 'project';
  event?: SelfieEvent;
  project?: ProjectModel;
}

const getAppointmentsByDay = (events: SelfieEvent[] | undefined, projects: ProjectModel[], date: Date): CombinedAppointment[] => {
  const appointments: CombinedAppointment[] = [];

  // Add events
  if (Array.isArray(events)) {
    events.forEach(event => {
      const eventDateStart = new Date(event.dtstart);
      const eventDateEnd = new Date(event.dtend);
      if (
        (date.getTime() <= eventDateEnd.getTime() && date.getTime() >= eventDateStart.getTime()) ||
        areSameDay(date, eventDateStart)
      ) {
        appointments.push({
          type: 'event',
          event: event
        });
      }
    });
  }

  // Add projects
  if (Array.isArray(projects)) {
    projects.forEach(project => {
      const projectDeadline = new Date(project.deadline);
      const projectStartDate = new Date(project.creationDate);

      if (areSameDay(date, projectStartDate)) {
        appointments.push({
          type: 'project',
          project: project
        });
      }
      else if (areSameDay(date, projectDeadline)) {
        appointments.push({
          type: 'project',
          project: project
        });
      }
    });
  }

  return appointments.sort((a, b) => {
    const dateA = new Date(a.type === 'event' ? a.event!.dtstart : a.project!.deadline);
    const dateB = new Date(b.type === 'event' ? b.event!.dtstart : b.project!.deadline);
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

// Appointment Display Component
const AppointmentsList = ({ events, projects, date, handleClick, isMonthView }: {
  events: SelfieEvent[] | undefined,
  projects: ProjectModel[],
  date: Date,
  handleClick: (item: CombinedAppointment) => void,
  isMonthView: boolean,
}): JSX.Element | null => {
  const todayAppointments = getAppointmentsByDay(events, projects, date);
  const appointmentsToShow = isMonthView ? todayAppointments.slice(0, 2) : todayAppointments;
  const { isMobile } = useContext(mobileContext) as any;

  const handleColor = (item: CombinedAppointment): string => {
    if (item.type === 'project') {
      return "bg-warning-100 text-warning-700 hover:border-warning-700";
    }

    if (Array.isArray(item.event?.participants) && item.event!.participants.length > 0) {
      if (item.event!.allDay) {
        return "bg-success-200 text-success-700 hover:border-success-700";
      }
      return "bg-default-100 text-default-700 hover:border-default-700";
    }

    if (item.event?.allDay) {
      return "bg-primary-200 text-primary-700 hover:border-primary-700";
    }
    return "bg-danger-100 text-danger-700 hover:border-danger-700";
  };

  return (
    <>
      {appointmentsToShow.map((item, index) => (
        <button
          onClick={() => handleClick(item)}
          key={index}
          className={`rounded-[100px] p-1 px-2 border-1 border-slate-300 text-left w-full overflow-hidden truncate dark:hover:border-1 ${handleColor(item)}`}
        >
          {(!isMobile && item.type === 'event' && !item.event?.allDay) && (
            <>
              <span className="font-medium">
                {formatEventTime(item.event as SelfieEvent)}
              </span>
              {" - "}
            </>
          )}
          {(!isMobile && item.type === 'project') && (
            <>
              <span className="font-medium">📋</span>
              {" - "}
            </>
          )}
          {item.type === 'event' ? item.event?.title : item.project?.title}
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
  projects: ProjectModel[];
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  isMonthView,
  day,
  date,
  isToday,
  events = [],
  projects,
}) => {
  const [isAllEventsOpen, setIsAllEventsOpen] = useState(false);
  const router = useRouter();
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const todayAppointments = getAppointmentsByDay(safeEvents, projects, cellDate);
  const hasMoreAppointments = todayAppointments.length > 2;
  const hasAppointments = todayAppointments.length > 0;
  const { isMobile } = useContext(mobileContext) as any;

  const handleClick = (item: CombinedAppointment) => {
    if (item.type === 'project') {
      router.push(`/projects/${item.project?._id}`);
    } else {
      router.push(`/calendar/${item.event?._id}`);
    }
  };

  // Shared button styles
  const dayButtonClass = isToday
    ? "text-slate-200 bg-[#9353d3] border-2 border-slate-300"
    : "bg-slate-800 text-white dark:text-white";

  // Modal Component
  const AppointmentsModal = () => (
    <Modal isOpen={isAllEventsOpen} onClose={() => setIsAllEventsOpen(false)} size="md">
      <ModalContent>
        <ModalHeader>Eventi e Progetti del {day} {monthNames[date.getMonth()]} </ModalHeader>
        <ModalBody className="p-4">
          <div className="space-y-3">
            {todayAppointments.map((item, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg border-2 hover:border-secondary cursor-pointer"
                onClick={() => {
                  handleClick(item);
                  setIsAllEventsOpen(false);
                }}
              >
                <p className="font-medium">
                  {item.type === 'project' ? (
                    <>
                      <span className="text-warning">📋 Progetto</span>
                      {" - "}
                    </>
                  ) : (
                    <>
                      <span className="text-primary">
                        {!item.event?.allDay && formatEventTime(item.event!)}
                      </span>
                      {!item.event?.allDay && " - "}
                    </>
                  )}
                  <b>{item.type === 'event' ? item.event?.title : item.project?.title}</b>
                </p>
                <p className="text-sm text-gray-500">
                  {item.type === 'project' ? (
                    <>Scadenza Progetto</>
                  ) : (
                    <>
                      {!item.event?.allDay && formatDate(new Date(item.event!.dtstart))}
                      {item.event?.allDay && "Tutto il giorno"}
                    </>
                  )}
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
            className={`text-bold justify-center w-[calc(82vw/7)] min-w-0 h-10 rounded-full p-0 ${dayButtonClass}`}
          >
            {day}
          </Button>
        )}
        <WeekViewGrid
          date={date}
          events={events}
          isMobile={isMobile}
          projects={projects}
        />
        <AppointmentsModal />
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
            <AppointmentsList
              events={safeEvents}
              projects={projects}
              date={cellDate}
              handleClick={handleClick}
              isMonthView={isMonthView}
            />
            {hasMoreAppointments && isMonthView && (
              <Button
                aria-label="tooManyAppoinments"
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
          {hasAppointments && (
            <div className="mt-[0.5rem] w-3 h-3 rounded-full bg-sky-300 mt-1" />
          )}
        </div>
      )}
      <AppointmentsModal />
    </div>
  );
};

export default CalendarCell;
