"use client";
import { Chip, Button, Tooltip } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import EventAdder from "@/components/calendar/eventAdder";
import CalendarCell from "@/components/calendar/calendarCell";
import { SelfieEvent, People } from "@/helpers/types";
import { reloadContext, mobileContext } from "./contextStore";

interface CalendarPageProps {
  initialEvents: SelfieEvent[];
  dbdate: Date;
  friends: People;
}

const CalendarPage = (props: CalendarPageProps) => {
  const [events, setEvents] = useState<SelfieEvent[]>(props.initialEvents);
  const [today, setToday] = useState(props.dbdate);
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState(props.dbdate);
  const [reloadEvents, setReloadEvents] = useState(false);
  const EVENTS_API_URL = "/api/events";

  async function fetchEvents() {
    try {
      var res = await fetch(`${EVENTS_API_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized, please login.");
      } else if (res.status >= 500) {
        throw new Error(`Server error: ${res.statusText}`);
      } else if (!res.ok) {
        throw new Error("Failed to fetch all the events");
      }
    } catch (e: unknown) {
      throw new Error(`Error during fetch events: ${(e as Error).message}`);
    }

    return await res.json();
  }

  async function fetchCurrentTime() {
    try {
      var res = await fetch("/api/config/time", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized, please login.");
      } else if (res.status >= 500) {
        throw new Error(`Server error: ${res.statusText}`);
      } else if (!res.ok) {
        throw new Error("Failed to get date time");
      }
    } catch (e) {
      throw new Error("Error during fetching date time, ");
    }

    return await res.json();
  }

  const setCurrentTime = async () => {
    const date = await fetchCurrentTime();
    setToday(new Date(date));
    setCurrentDate(new Date(date));
  };

  const setAllEvents = async () => {
    const events = await fetchEvents();
    setEvents(events);
  };


  useEffect(() => {
    if (reloadEvents) {
      console.log("sto fetchando gli eventi");
      //setCurrentTime();
      setAllEvents();
      setReloadEvents(false);
    }
  }, [reloadEvents]);


  useEffect(() => {
    console.log("primo fetch degli eventi gli eventi");
    setAllEvents();
  }, []);

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

  const renderCalendar = () => {
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
          dayIndex === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear();

        week.push(
          <td
            key={`cell-${i}-${j}`}
            className={`border ${isValidDay ? "bg-white dark:bg-black" : "bg-zinc-800"} border-gray-400 p-1 md:p-2 align-top h-24 md:h-32 lg:h-40`}
          >
            {isValidDay ? (
              <CalendarCell
                day={dayIndex}
                date={currentDate}
                isToday={isToday}
                events={events}
              />
            ) : null}
          </td>,
        );
      }
      days.push(<tr key={`row-${i}`}>{week}</tr>);
    }

    return days;
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

  const handleToday = () => {
    setCurrentTime();
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + increment,
        1,
      ),
    );
  };

  return (
    <mobileContext.Provider value={{ isMobile, setIsMobile }}>
      <reloadContext.Provider value={{ reloadEvents, setReloadEvents }}>
        <div
          className="flex flex-col md:flex-row min-h-screen relative"
          aria-label="Back Ground Calendar"
        >
          <div className="flex-grow">
            <div className="bg-white dark:bg-black h-screen flex flex-col">
              <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-slate-300 dark:bg-zinc-900">
                <button
                  onClick={() => changeMonth(-1)}
                  className="text-white hover:text-yellow-300 text-xl md:text-2xl"
                >
                  &lt;
                </button>
                <EventAdder
                  friends={props.friends}
                  isMobile={isMobile}
                  aria-label="Event Adder Button"
                />
                <Tooltip
                  content={today.toISOString().split('T')[0]}
                  showArrow
                  key="tooltip day"
                  delay={0}
                  closeDelay={0}
                  placement="top"
                  classNames={{
                    base: [
                      "before:bg-neutral-400 dark:before:bg-white",
                    ],
                    content: [
                      "py-2 px-4 shadow-xl",
                      "text-black bg-gradient-to-br from-white to-neutral-400",
                    ],
                  }}>
                  <Chip
                    variant="solid"
                    className="text-base rounded-xl py-5 bg-default"
                  >
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Chip>
                </Tooltip>
                <Button
                  variant="solid"
                  onClick={handleToday}
                  className="text-white text-base rounded-xl bg-primary border-transparent border-2 hover:border-white"
                >
                  Oggi
                </Button>
                <button
                  onClick={() => changeMonth(1)}
                  className="text-white hover:text-yellow-300 text-xl md:text-2xl"
                >
                  &gt;
                </button>
              </div>
              <div className="flex-grow overflow-auto">
                <table className="w-full h-full table-fixed">
                  <thead>
                    <tr>
                      {["Sun", "Mon", "Tus", "Wed", "Thr", "Fri", "Sat"].map(
                        (day) => (
                          <th
                            key={day}
                            className="h-1 border border-black dark:border-white text-center bg-slate-400 dark:bg-black text-white dark:text-white text-xs md:text-sm w-1/7 h-1/9"
                          >
                            {day}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-slate-500 dark:bg-black text-xs md:text-sm">
                    {renderCalendar()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </reloadContext.Provider>
    </mobileContext.Provider>
  );
};

export default CalendarPage;
