"use client";

import React, { useState, useContext, ReactElement } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@nextui-org/react";
import {
  SelfieEvent,
  ProjectModel,
  CombinedAppointment,
} from "@/helpers/types";
import { useRouter } from "next/navigation";
import WeekViewGrid from "./weekViewGrid";
import { mobileContext } from "./contextStore";
import { TaskMutiResponse } from "@/helpers/api-types";
import {
  formatEventTime,
  getAppointmentsByDay,
  formatDate,
} from "@/helpers/calendar";

enum AppointmentButtonColor {
  EVENT = "primary",
  PROJECT = "warning",
  TASK = "secondary",
  PROJECT_TASK = "danger",
  ALL_DAY = "info",
  GROUP_EVENT = "success",
}

const AppointmentsList = ({
  events,
  projects,
  tasks,
  date,
  handleClick,
  isMonthView,
  hasMoreAppointments,
  setIsAllEventsOpen,
}: {
  events: SelfieEvent[] | undefined;
  projects: ProjectModel[];
  tasks: TaskMutiResponse | undefined;
  date: Date;
  handleClick: (item: CombinedAppointment) => void;
  isMonthView: boolean;
  hasMoreAppointments: boolean;
  setIsAllEventsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement | null => {
  const todayAppointments = getAppointmentsByDay(events, projects, tasks, date);
  const appointmentsToShow = isMonthView
    ? todayAppointments.slice(0, 2)
    : todayAppointments;
  const { isMobile } = useContext(mobileContext) as any;

  const handleColor = (item: CombinedAppointment): string => {
    if (item.type === "project") {
      return `bg-${AppointmentButtonColor.PROJECT}-100 bg-${AppointmentButtonColor.PROJECT}-700 hover:border-${AppointmentButtonColor.PROJECT}-700`;
    }

    if (item.type === "task") {
      return `bg-${AppointmentButtonColor.TASK}-100 bg-${AppointmentButtonColor.TASK}-700 hover:border-${AppointmentButtonColor.TASK}-700`;
    }

    if (item.type === "project-task") {
      return `bg-${AppointmentButtonColor.PROJECT_TASK}-100 bg-${AppointmentButtonColor.PROJECT_TASK}-700 hover:border-${AppointmentButtonColor.PROJECT_TASK}-700`;
    }

    // evento di gruppo
    if (
      Array.isArray(item.event?.participants) &&
      item.event!.participants.length > 0
    ) {
      return `bg-${AppointmentButtonColor.GROUP_EVENT}-100 bg-${AppointmentButtonColor.GROUP_EVENT}-700 hover:border-${AppointmentButtonColor.GROUP_EVENT}-700`;
    }

    // evento tutto il giorno
    if (item.event?.allDay) {
      return `bg-${AppointmentButtonColor.ALL_DAY}-100 bg-${AppointmentButtonColor.ALL_DAY}-700 hover:border-${AppointmentButtonColor.ALL_DAY}-700`;
    }

    // evento normale
    return `bg-${AppointmentButtonColor.EVENT}-100 bg-${AppointmentButtonColor.EVENT}-700 hover:border-${AppointmentButtonColor.EVENT}-700`;
  };

  return (
    <>
      {appointmentsToShow.map((item, index) => (
        <button
          onClick={() => handleClick(item)}
          key={index}
          className={`rounded-[100px] p-1 px-2 border-1 border-slate-300 text-left w-full overflow-hidden truncate dark:hover:border-1 ${handleColor(item)}`}
        >
          {!isMobile && item.type === "event" && !item.event?.allDay && (
            <>
              <span className="font-medium">
                {formatEventTime(item.event as SelfieEvent, date.getDate())}
              </span>
            </>
          )}
          {!isMobile && item.type === "project" && (
            <>
              <span className="font-medium">📋</span>
              {" - "}
            </>
          )}
          {!isMobile && item.type === "task" && (
            <>
              <span className="font-medium">📝</span>
              {" - "}
            </>
          )}
          {!isMobile && item.type === "project-task" && (
            <>
              <span className="font-medium">📝</span>
              {" - "}
            </>
          )}
          {item.event?.title ||
            item.project?.title ||
            item.task?.name ||
            item.projectTask?.title}
        </button>
      ))}
      {hasMoreAppointments && isMonthView && (
        <Button
          aria-label="tooManyAppoinments"
          className="h-fit w-full rounded-[100px] bg-primary text-white border-2 border-transparent hover:border-white"
          onClick={() => setIsAllEventsOpen(true)}
        >
          ...
        </Button>
      )}
    </>
  );
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarCellProps {
  isMonthView: boolean;
  day: number;
  date: Date;
  isToday: boolean;
  events?: SelfieEvent[];
  projects: ProjectModel[];
  tasks: TaskMutiResponse | undefined;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  isMonthView,
  day,
  date,
  isToday,
  events = [],
  projects,
  tasks,
}) => {
  const [isAllEventsOpen, setIsAllEventsOpen] = useState(false);
  const router = useRouter();
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const todayAppointments = getAppointmentsByDay(
    safeEvents,
    projects,
    tasks,
    cellDate,
  );
  const hasMoreAppointments = todayAppointments.length > 2;
  const { isMobile } = useContext(mobileContext) as any;

  const handleClick = (item: CombinedAppointment) => {
    if (item.type === "project") {
      router.push(`/projects/${item.project?._id}`);
    } else if (item.type === "event") {
      router.push(`/calendar/${item.event?._id}`);
    } else if (item.type === "task") {
      router.push(`/task`);
    } else if (item.type === "project-task") {
      router.push(`/projects/${item.projectId}`);
    }
  };

  const dayButtonClass = isToday
    ? "text-slate-200 bg-[#9353d3] border-2 border-slate-300"
    : "bg-slate-800 text-white dark:text-white";

  const AppointmentsModal = () => (
    <>
    <Modal
     
      isOpen={isAllEventsOpen}
      onClose={() => setIsAllEventsOpen(false)}
      size="md"
    >
      <ModalContent>
        <ModalHeader>
          Events, Projects and Activity {day} {monthNames[date.getMonth()]}{" "}
        </ModalHeader>
        <ModalBody className="p-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-3">
            {todayAppointments.map((item, index) => (
              <Button
                variant="bordered"
                key={index}
                className="p-3 border rounded-lg border-2 hover:border-secondary cursor-pointer w-full"
                onPress={() => {
                  handleClick(item);
                  setIsAllEventsOpen(false);
                }}
              >
                <p className="font-medium">
                  {item.type === "project" ? (
                    <>
                      <span
                        className={"text-" + AppointmentButtonColor.PROJECT}
                      >
                        📋 Project
                      </span>
                      {" - "}
                    </>
                  ) : item.type === "task" ? (
                    <>
                      <span className={"text-" + AppointmentButtonColor.TASK}>
                        📝 Activity
                      </span>
                      {" - "}
                    </>
                  ) : item.type === "project-task" ? (
                    <>
                      <span
                        className={
                          "text-" + AppointmentButtonColor.PROJECT_TASK
                        }
                      >
                        📝 Close Project Activity
                      </span>
                      {" - "}
                    </>
                  ) : (
                    <>
                      <span className={"text-" + AppointmentButtonColor.EVENT}>
                        {!item.event?.allDay &&
                          formatEventTime(item.event!, date.getDate())}
                      </span>
                    </>
                  )}
                  <b>
                    {item.event?.title ||
                      item.project?.title ||
                      item.task?.name ||
                      item.projectTask?.title}
                  </b>
                </p>
                <p className="text-sm text-gray-500">
                  {item.type === "project" ? (
                    <>Project Deadline</>
                  ) : item.type === "task" || item.type === "project-task" ? (
                    <>Activity Deadline</>
                  ) : (
                    <>
                      {!item.event?.allDay &&
                        formatDate(new Date(item.event!.dtstart))}
                      {item.event?.allDay && "All day long"}
                    </>
                  )}
                </p>
              </Button>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  </>
  );

  if (!isMonthView) {
    return (
      <div
        aria-label="weekView"
        className={`h-full w-full rounded-[20px] ${isToday ? "bg-blue-100" : ""}`}
      >
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
          tasks={tasks?.activities}
        />
        <AppointmentsModal />
      </div>
    );
  }

  return (
    <div
      aria-label="monthView"
      className={
        isMobile
          ? "w-[calc(87vw/7)] h-[calc(87vw/7)] flex flex-col items-center"
          : "w-full"
      }
    >
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
              tasks={tasks}
              date={cellDate}
              handleClick={handleClick}
              isMonthView={isMonthView}
              hasMoreAppointments={hasMoreAppointments}
              setIsAllEventsOpen={setIsAllEventsOpen}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Button
            className={`w-10 h-10 min-w-0 rounded-full p-0 ${dayButtonClass}`}
            onPress={() => setIsAllEventsOpen(true)}
          >
            {day}
          </Button>
          {todayAppointments && todayAppointments.length > 0 && (
            <>
              {todayAppointments.some((a) => a.type === "event") && (
                <div className="mt-[0.5rem] w-3 h-3 rounded-full mt-1 bg-primary" />
              )}
              {todayAppointments.some((a) => a.type === "project") && (
                <div className="mt-[0.5rem] w-3 h-3 rounded-full mt-1 bg-warning" />
              )}
              {todayAppointments.some((a) => a.type === "task") && (
                <div className="mt-[0.5rem] w-3 h-3 rounded-full mt-1 bg-green-400" />
              )}
              {todayAppointments.some((a) => a.type === "project-task") && (
                <div className="mt-[0.5rem] w-3 h-3 rounded-full mt-1 bg-danger" />
              )}
            </>
          )}
        </div>
      )}
      <AppointmentsModal />
    </div>
  );
};

export default CalendarCell;
