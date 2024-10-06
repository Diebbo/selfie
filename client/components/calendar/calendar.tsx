"use client";
import { Calendar, Chip, Button } from "@nextui-org/react";
import leftArrowIcon  from "../icons/calendar";
import React, { useState, useEffect } from 'react';
import NewElementAdder from "@/components/calendar/event";
import { fetchEvents } from "@/actions/events";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const fetchAllNotes = async () => {
      const notes = await fetchEvents();
    };
    fetchAllNotes();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Aggiorna 'today' ogni giorno a mezzanotte
    const timer = setInterval(() => {
      setToday(new Date());
    }, 1000 * 60 * 60 * 24);

    return () => clearInterval(timer);
  }, []);
  
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const startingDay = firstDayOfMonth(currentDate);
    const rows = Math.ceil((totalDays + startingDay) / 7);

    let days = [];
    let day = 1;

    for (let i = 0; i < rows; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          week.push(<td key={`empty-${j}`} className="p-1 md:p-2 border-b border-gray-700 text-center text-gray-500 hover:bg-red-300"></td>);
        } else if (day > totalDays) {
          week.push(<td key={`empty-end-${j}`} className="p-1 md:p-2 border-b border-gray-700 text-center text-gray-500 hover:bg-red-300"></td>);
        } else {
          const isToday = day === today.getDate() && 
                          currentDate.getMonth() === today.getMonth() && 
                          currentDate.getFullYear() === today.getFullYear();
          week.push(
            <td key={day} className={`md:p-2 border-b border-gray-300 text-right align-top ${isToday ? 'bg-teal-300 text-black hover:bg-lime-400 hover:text-black' : 'text-white hover:bg-lime-400 hover:text-black'}`}>
              {day}
            </td>
          );
          day++;
        }
      }
      days.push(<tr key={i}>{week}</tr>);
    }

    return days;
  };

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  
  const handleToday = () => {
    setCurrentDate(new Date());
  }
  
  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen" aria-label="Back Ground Calendar" >
      <div className="flex-grow">
        <div className="bg-black h-screen flex flex-col">
          <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-zinc-900">
            <button onClick={() => changeMonth(-1)} className="text-white hover:text-yellow-300 text-xl md:text-2xl">
              &lt;
            </button>
            <Chip variant="shadow" className="rounded-xl py-5 bg-gradient-to-br from-indigo-500 to-pink-500" >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Chip>
            <Button variant="shadow" onClick={handleToday} className="text-white rounded-xl transition-all duration-500 bg-gradient-to-tl from-pink-500 via-red-500 to-yellow-400"> Today </Button> 
            <button onClick={() => changeMonth(1)} className="text-white hover:text-yellow-300 text-xl md:text-2xl">
              &gt;
            </button>
          </div>
          <div className="flex-grow overflow-auto">
            <table className="w-full h-full">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tus", "Wed", "Thr", "Fri", "Sat"].map((day) => (
                    <th key={day} className="h-10 border border-white text-center bg-black text-white text-xs md:text-sm">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs md:text-sm">{renderCalendar()}</tbody>
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
        <div className="w-full md:w-72 bg-black shadow-lg p-4">
          <Calendar 
            aria-label="Sidebar Calendar" 
            showMonthAndYearPickers 
          />
          <div className="relative text-center">
            <NewElementAdder aria-label="Event Adder Button" className=""/>
          </div>
          </div>
      )}
    </div>
  );
};

export default CalendarPage;
