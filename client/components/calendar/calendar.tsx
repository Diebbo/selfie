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
    console.log("fine fetch degli eventi");
  }, []);
  console.log("ahaha", user);

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
            className={`border ${isValidDay ? "bg-white dark:bg-black" : "bg-gray-300 dark:bg-zinc-600"} border-gray-400 p-1 md:p-2 align-top h-24 md:h-32 lg:h-40`}
          >
            {isValidDay ? (
              <CalendarCell
                day={dayIndex}
                date={currentDate as Date}
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
                  onClick={() => changeMonth(-1)}
                  className="text-white hover:text-yellow-300 text-xl md:text-2xl"
                >
                  &lt;
                </button>

                <div className="flex items-center gap-4">
                  <span className={`text-sm ${!isMonthView ? 'text-gray-500' : 'text-primary font-medium'}`}>
                    Mese
                  </span>
                  <Switch
                    checked={isMonthView}
                    onValueChange={handleToggle}
                    className="data-[state=checked]:bg-primary"
                    aria-label="Cambia visualizzazione"
                  />
                  <span className={`text-sm ${isMonthView ? 'text-gray-500' : 'text-primary font-medium'}`}>
                    Settimana
                  </span>
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
                    className="text-base rounded-xl py-5 text-white bg-secondary dark:text-white dark:bg-default"
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
                  onClick={() => changeMonth(1)}
                  className="text-white hover:text-yellow-300 text-xl md:text-2xl"
                >
                  &gt;
                </button>
              </div>
              {isMonthView &&
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
              }

              {!isMonthView &&
                <span> Settimana </span>
              }
            </div>
          </div>
        </div>
      </reloadContext.Provider>
    </mobileContext.Provider>
  );
};

export default CalendarPage;
