"use client";
import { Calendar } from "@nextui-org/react";
import React, { useState, useEffect } from 'react';
/*
import {
  fetchEvents,
  fetchEventById,
  saveEvent,
  deleteEvent
} from "@/actions/calendar";
*/

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
          week.push(
            <td key={day} className="md:p-2 border-b border-gray-300 text-center align-top text-white hover:bg-lime-300 hover:text-lime-600 hover:font-bold">
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

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen" aria-label="Back Ground Calendar" >
      <div className="flex-grow p-2 md:p-4">
        <div className="bg-black h-full flex flex-col">
          <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-zinc-900">
            <button onClick={() => changeMonth(-1)} className="text-white hover:text-yellow-300 text-xl md:text-2xl">
              &lt;
            </button>
            <h2 className="text-lg md:text-2xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              &nbsp; Aggiungere components di NextUI e togliere i &lt; e &gt;
            </h2>
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
          Bottone Aggiunta: Eventi, Attività, Progetto
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
