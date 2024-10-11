"use client";
import { Calendar, Chip, Button, DateValue } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import NewElementAdder from "@/components/calendar/event";
import CalendarCell from "@/components/calendar/calendarCell";
import { SelfieEvent } from "@/helpers/types";

const CalendarPage = () => {
  const [events, setEvents] = useState<SelfieEvent[]>([]);
  const [today, setToday] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  // const [participants, setParticipants] = useState<Person[]>([]);
  const EVENTS_API_URL = "/api/events";

  async function fetchEvents() {
    try {
      var res = await fetch(`${EVENTS_API_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      /*if (res.status === 401) {
        throw new AuthenticationError("Unauthorized, please login.");
      } else if (res.status >= 500) {
        throw new ServerError(`Server error: ${res.statusText}`);
      } else if (!res.ok) {
        throw new Error("Failed to create events");
        }*/
    } catch (e: unknown) {
      throw new Error(`Error during fetch events: ${(e as Error).message}`);
    }

    return await res.json();
  }

  useEffect(() => {
    const fetchAllNotes = async () => {
      const events = await fetchEvents();
      setEvents(events);
    };
    fetchAllNotes();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Aggiorna 'today' ogni giorno a mezzanotte
    const timer = setInterval(
      () => {
        setToday(new Date());
      },
      1000 * 60 * 60 * 24,
    );

    return () => clearInterval(timer);
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
            className="border border-gray-400 p-1 md:p-2 align-top h-24 md:h-32 lg:h-40"
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
    setCurrentDate(new Date());
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
    <div
      className="flex flex-col md:flex-row min-h-screen"
      aria-label="Back Ground Calendar"
    >
      <div className="flex-grow">
        <div className="bg-black h-screen flex flex-col">
          <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-slate-300 dark:bg-zinc-900">
            <button
              onClick={() => changeMonth(-1)}
              className="text-white hover:text-yellow-300 text-xl md:text-2xl"
            >
              &lt;
            </button>
            <Chip
              variant="solid"
              className="rounded-xl py-5 bg-gradient-to-br from-indigo-500 to-pink-500"
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Chip>
            <Button
              variant="shadow"
              onClick={handleToday}
              className="text-white rounded-xl transition-all duration-500 bg-gradient-to-tl from-pink-500 via-red-500 to-yellow-400 hover:text-slate-700"
            >
              Today
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
                        className="h-10 border border-black dark:border-white text-center bg-slate-400 dark:bg-black text-white dark:text-white text-xs md:text-sm w-1/7 h-1/9"
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
      <div
        className={`resizer w-1 bg-white cursor-col-resize ${
          isMobile ? "hidden" : ""
        }`}
      />
      {!isMobile && (
        <div className="w-full md:w-72 bg-black p-4">
          <Calendar aria-label="Sidebar Calendar" showMonthAndYearPickers />
          <div className="relative text-center">
            <NewElementAdder aria-label="Element Adder Button" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
