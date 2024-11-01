"use client";

import { Chip, Button, Tooltip, Switch } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import EventAdder from "@/components/calendar/eventAdder";
import CalendarCell from "@/components/calendar/calendarCell";
import { SelfieEvent, Person, People } from "@/helpers/types";
import { reloadContext, mobileContext } from "./contextStore";

const CalendarPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reloadEvents, setReloadEvents] = useState(false);
  const [friends, setFriends] = useState<Person[] | null>(null);
  const [user, setUser] = useState<Person | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<SelfieEvent[] | undefined>(undefined);
  const [isMonthView, setIsMonthView] = useState(true);


  async function fetchWithErrorHandling(url: string) {
    try {
      const res = await fetch(url, {
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
        throw new Error(`Failed to fetch from ${url}`);
      }

      return await res.json();
    } catch (e: unknown) {
      console.error(`Error fetching from ${url}:`, (e as Error).message);
      return null;
    }
  }

  const setAllEvents = async () => {
    try {
      // Fetch date first since we need it for other operations
      const dateData = await fetchWithErrorHandling('/api/config/time');
      if (dateData) {
        setCurrentDate(new Date(dateData));
        setToday(new Date(dateData));
      }

      // Fetch user data
      const userData = await fetchWithErrorHandling('/api/users/id');
      if (userData) {
        const person: Person = {
          _id: userData._id as string,
          avatar: "",
          friends: userData.friends as Person[],
          events: {
            created: userData.events as SelfieEvent[],
            participating: userData.participatingEvents as SelfieEvent[],
          },
          username: userData.username as string,
          password: userData.password as string,
          name: userData.name as string,
          surname: userData.surname as string,
          email: userData.email as string,
          birthDate: new Date(userData.birthDate as string),
          address: userData.address as string,
          city: userData.city as string,
          state: userData.state as string,
          zip: userData.zip as string,
          country: userData.country as string,
        };
        setUser(person);
        setEvents(person.events.created.concat(person.events.participating));
        setFriends(person.friends as Person[]);
      }

    } catch (error) {
      console.error('Error in setAllEvents:', error);
    }
  };

  useEffect(() => {
    if (reloadEvents) {
      console.log("sto fetchando gli eventi");
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


  const renderCalendarWeek = () => {

    if (!currentDate) return <span>  testo </span>;

    const daysOfWeek = [];
    const currentWeekStart = new Date(currentDate);

    // Adjust to the start of the week (Sunday)
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(currentWeekStart.getDate() + i);

      const isToday =
        dayDate.getDate() === today?.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      daysOfWeek.push(
        <td
          key={`week-cell-${i}`}
          className={`border bg-white w-full dark:bg-black border-gray-400 p-1 md:p-2 align-top h-24 md:h-32 lg:h-40`}
        >
          <CalendarCell
            isMonthView={isMonthView}
            day={dayDate.getDate()}
            date={dayDate}
            isToday={isToday}
            events={events}
          />
        </td>
      );
    }

    return (
      <tr>
        {daysOfWeek}
      </tr>);

  };


  const renderCalendarMonth = () => {
    const totalDays = daysInMonth(currentDate as Date);
    const startingDay = firstDayOfMonth(currentDate as Date);
    const rows = 6; // Fissiamo il numero di righe a 6 per coprire tutti i possibili casi

    let days = [];

    for (let i = 0; i < rows; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j - startingDay + 1;
        const isValidDay = dayIndex > 0 && dayIndex <= totalDays;

        const isToday =
          isValidDay &&
          dayIndex === today?.getDate() &&
          currentDate?.getMonth() === today.getMonth() &&
          currentDate?.getFullYear() === today.getFullYear();

        week.push(
          <td
            key={`cell-${i}-${j}`}
            className={`border ${isValidDay ? "bg-white dark:bg-black" : "bg-gray-300 dark:bg-zinc-600"} border-gray-400 p-1 md:p-2 align-top h-[calc(87vh/6)]`}
          >
            {isValidDay ? (
              <CalendarCell
                isMonthView={isMonthView}
                day={dayIndex}
                date={currentDate as Date}
                isToday={isToday}
                events={events}
              />
            ) : null}
          </td>,
        );
      }
      days.push(<tr
        key={`row-${i}`}
        className="overflow-y-auto scrollbar max-h-[calc(85vh)]"
      >{week}</tr>);
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
    setCurrentDate(today);
  };

  const handleToggle = () => {
    setIsMonthView(!isMonthView);
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(
      new Date(
        currentDate?.getFullYear() as number,
        currentDate?.getMonth() as number + increment,
        1,
      ),
    );
  };

  const changeWeek = (increment: number) => {
    if (currentDate) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (increment));
      setCurrentDate(newDate);
    }
  };

  if (!currentDate || !today || friends === null || user === null || events === undefined) {
    console.log("dio bello", currentDate, today, friends, user, events);
    return (<span> Caricamento... </span>);
  }
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

                <EventAdder
                  friends={friends as People}
                  isMobile={isMobile}
                  aria-label="Event Adder Button"
                />

                <button
                  onClick={() => { isMonthView ? changeMonth(-1) : changeWeek(-7) }}
                  className="text-white hover:text-yellow-300 text-xl md:text-2xl"
                >
                  &lt;
                </button>

                <div className="flex items-center gap-4">
                  <Switch
                    defaultSelected={true}
                    onValueChange={handleToggle}
                    color="primary"
                    startContent={<span> M </span>}
                    endContent={<span> W </span>}
                    className="data-[state=checked]:bg-primary"
                    aria-label="Cambia visualizzazione"
                  />
                </div>

                <Tooltip
                  content={today?.toISOString().split('T')[0]}
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
                      "text-black bg-gradient-to-br from-white to-violet-500 dark:bg-gradient-to-br dark:from-white dark:to-neutral-600",
                    ],
                  }}>
                  <Chip
                    variant="solid"
                    className={`${isMobile ? "h-1" : ""} text-base rounded-xl py-5 text-white bg-secondary dark:text-white dark:bg-default`}
                  >
                    {monthNames[currentDate?.getMonth() as number]} {currentDate?.getFullYear()}
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
                  onClick={() => { isMonthView ? changeMonth(1) : changeWeek(7) }}
                  className="text-white hover:text-yellow-300 text-xl md:text-2xl"
                >
                  &gt;
                </button>
              </div>
              <div className="flex-grow overflow-auto">
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
                  {
                    isMonthView &&
                    <tbody className="scrollbar-hide max-h-[calc(50vh)] bg-slate-500 dark:bg-black text-xs md:text-sm">
                      {renderCalendarMonth()}
                    </tbody>
                  }

                  {!isMonthView &&
                    <tbody
                      className="h-full bg-slate-500 dark:bg-black text-xs md:text-sm">
                      {renderCalendarWeek()}
                    </tbody>
                  }
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
