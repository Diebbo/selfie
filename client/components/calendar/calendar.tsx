"use client";

import { Chip, Button, Tooltip, Switch } from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react";
import EventAdder from "@/components/calendar/eventAdder";
import CalendarCell from "@/components/calendar/calendarCell";
import { SelfieEvent, People, ProjectModel, ResourceModel } from "@/helpers/types";
import { useReload, mobileContext } from "./contextStore";
import { getEvents } from "@/actions/events";
import { useTime } from "../contexts/TimeContext";
import { TaskMutiResponse } from "@/helpers/api-types";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CalendarPageProps {
  createdEvents: SelfieEvent[];
  participatingEvents: SelfieEvent[];
  dbdate: Date;
  friends: People;
  projects: ProjectModel[];
  tasks: TaskMutiResponse;
  resource: ResourceModel[];
}

const CalendarPage = (props: CalendarPageProps) => {
  //concat of 2 events arraies
  const [events, setEvents] = useState<SelfieEvent[]>(
    props.createdEvents.concat(props.participatingEvents),
  );
  const { currentTime } = useTime();
  const [isMobile, setIsMobile] = useState(false);
  const tmp = new Date(currentTime);
  tmp.setHours(0, 0, 0, 0);
  const [currentDate, setCurrentDate] = useState(tmp);

  const [isMonthView, setIsMonthView] = useState(true);
  const { reloadEvents, setReloadEvents } = useReload();
  const prevTimeRef = useRef<Date>(currentTime);

  const setCurrentTime = async () => {
    // set the current date to midnight
    const tmp = new Date(currentTime);
    tmp.setHours(0, 0, 0, 0);
    setCurrentDate(tmp);
  };

  useEffect(() => {
    if (reloadEvents) {
      const e = getEvents();
      e.then((events) => {
        setEvents(events);
      });
      setReloadEvents(false);
    }
  }, [reloadEvents]);

  // Move month view when Time changes in time machine
  useEffect(() => {
    // Calcola la differenza in ore tra il nuovo currentTime e il precedente
    const hoursDifference = Math.abs(
      (currentTime.getTime() - prevTimeRef.current.getTime()) /
      (1000 * 60 * 60),
    );

    // Aggiorna currentDate solo se la differenza è maggiore di 24 ore
    if (hoursDifference >= 1) {
      setCurrentDate(currentTime);
    }

    // Aggiorna il riferimento al tempo precedente
    prevTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarWeek = () => {
    if (!currentDate) return <span> testo </span>;

    const daysOfWeek = [];
    const currentWeekStart = new Date(currentDate);

    // Adjust to the start of the week (Sunday)
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(currentWeekStart.getDate() + i);

      const isToday =
        dayDate.getDate() === currentTime?.getDate() &&
        dayDate.getMonth() === currentTime.getMonth() &&
        dayDate.getFullYear() === currentTime.getFullYear();

      daysOfWeek.push(
        <td
          key={`week-cell-${i}`}
          className={`border bg-white w-full dark:bg-black border-gray-400 p-1 md:p-2 align-top h-full`}
        >
          <CalendarCell
            isMonthView={isMonthView}
            day={dayDate.getDate()}
            date={dayDate}
            isToday={isToday}
            events={events}
            projects={props.projects}
            tasks={props.tasks}
          />
        </td>,
      );
    }

    return <tr>{daysOfWeek}</tr>;
  };

  const renderCalendarMonth = () => {
    const totalDays = daysInMonth(currentDate);
    const startingDay = firstDayOfMonth(currentDate);
    const rows = 6; // Fissiamo il numero di righe a 6 per coprire tutti i possibili casi

    let days = [];

    for (let i = 0; i < rows; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j - startingDay + 1;
        const isValidDay = dayIndex > 0 && dayIndex <= totalDays;

        const isToday =
          isValidDay &&
          dayIndex === currentTime.getDate() &&
          currentDate.getMonth() === currentTime.getMonth() &&
          currentDate.getFullYear() === currentTime.getFullYear();

        week.push(
          <td
            key={`cell-${i}-${j}`}
            className={`border ${isValidDay ? "bg-white dark:bg-black" : "bg-gray-300 dark:bg-zinc-600"} border-gray-400 p-1 md:p-2 align-top h-[calc(87vh/6)]`}
          >
            {isValidDay ? (
              <CalendarCell
                isMonthView={isMonthView}
                day={dayIndex}
                date={currentDate}
                isToday={isToday}
                events={events}
                projects={props.projects}
                tasks={props.tasks}
              />
            ) : null}
          </td>,
        );
      }
      days.push(
        <tr
          key={`row-${i}`}
          className="overflow-y-auto scrollbar max-h-[calc(77vh)]"
        >
          {week}
        </tr>,
      );
    }

    return days;
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

  const handleToday = () => {
    setCurrentTime();
  };

  const handleToggle = () => {
    setIsMonthView(!isMonthView);
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear() as number,
        (currentDate.getMonth() as number) + increment,
        1,
      ),
    );
  };

  const changeWeek = (increment: number) => {
    if (currentDate) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + increment);
      setCurrentDate(newDate);
    }
  };

  return (
    <mobileContext.Provider value={{ isMobile, setIsMobile }}>
      <div
        className="flex flex-col md:flex-row relative h-full overflow-y-hidden"
        aria-label="Back Ground Calendar"
      >
        <div className="flex-grow">
          <div className="bg-white dark:bg-black flex flex-col">
            <div className="flex items-center justify-between px-2 md:px-4 py-2 gap-0 bg-slate-300 dark:bg-zinc-900 w-full">
              <EventAdder
                friends={props.friends}
                isMobile={isMobile}
                resource={props.resource}
                aria-label="Event Adder Button"
              />

              <Button
                onPress={() => {
                  isMonthView ? changeMonth(-1) : changeWeek(-7);
                }}
                variant="flat"
                color="primary"
                isIconOnly
              >
                <ArrowLeft />
              </Button>
              <div className="flex items-center mr-0">
                <Switch
                  defaultSelected={true}
                  onValueChange={handleToggle}
                  color="primary"
                  startContent={<span> M </span>}
                  endContent={<span> W </span>}
                  aria-label="Change visualization"
                  className={`data-[state=checked]:bg-primary [&>*]:mr-0`}
                />
              </div>

              <Tooltip
                content={currentTime.toISOString().split("T")[0]}
                showArrow
                key="tooltip day"
                delay={0}
                closeDelay={0}
                placement="top"
                classNames={{
                  base: ["before:bg-neutral-400 dark:before:bg-white"],
                  content: [
                    "py-2 px-4 shadow-xl",
                    "text-black bg-gradient-to-br from-white to-violet-500 dark:bg-gradient-to-br dark:from-white dark:to-neutral-600",
                  ],
                }}
              >
                <Chip
                  variant="solid"
                  className={`${isMobile ? "h-1" : ""} text-base rounded-xl py-5 text-white bg-secondary dark:text-white dark:bg-default`}
                >
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </Chip>
              </Tooltip>
              <Button
                variant="solid"
                onPress={handleToday}
                className="text-white text-base rounded-xl bg-primary border-transparent border-2 hover:border-white"
              >
                Today
              </Button>
              <Button
                onPress={() => {
                  isMonthView ? changeMonth(1) : changeWeek(7);
                }}
                variant="flat"
                color="primary"
                isIconOnly
              >
                <ArrowRight />
              </Button>
            </div>
            <div className="flex overflow-auto">
              <table className="w-full h-full table-fixed">
                <thead>
                  <tr className="h-2">
                    {["Sun", "Mon", "Tus", "Wed", "Thr", "Fri", "Sat"].map(
                      (day) => (
                        <th
                          key={day}
                          aria-label="day line"
                          className={`max-h-1 border border-black dark:border-white text-center bg-slate-400 dark:bg-black text-white dark:text-white text-xs md:text-sm w-1/7`}
                        >
                          {day}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                {isMonthView && (
                  <tbody className="scrollbar-hide bg-slate-500 dark:bg-black text-xs md:text-sm">
                    {renderCalendarMonth()}
                  </tbody>
                )}

                {!isMonthView && (
                  <tbody className="bg-slate-500 dark:bg-black text-xs md:text-sm">
                    {renderCalendarWeek()}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </mobileContext.Provider>
  );
};

export default CalendarPage;
