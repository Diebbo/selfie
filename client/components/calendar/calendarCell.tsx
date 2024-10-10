"use client";

import React from 'react';
import { Card, CardBody, Badge } from '@nextui-org/react';

const areSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

const getEventsByDay = (events, date) => {
  if (!Array.isArray(events) || !date || !(date instanceof Date)) {
    throw new Error('Input non valido');
  }

  return events.filter(event => {
    const eventDate = new Date(event.dtstart);
    return areSameDay(eventDate, date);
  });
}

const showEvents = (events, date) => {
  const todayEvents = getEventsByDay(events, date);
  return (
    todayEvents.map((event, index) => (
      <button className="p-2 bg-slate-700 truncate ...">
        {event.title}
      </button>
    ))
  );
}

const CalendarCell = ({ day, date, isToday, events = [] }) => {
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  
  return (
    <Card>
      <CardBody className="p-0 flex flex-col bg-black">
        <div className={`p-2 rounded-[100px] bg-slate-800 text-sm font-bold ${isToday ? 'text-blue-500' : 'text-dark dark:text-white'}`}>
          {day}
        </div>
        <div className="mt-1 rounded-[100px] space-y-1 overflow-hidden">
          {showEvents(events, cellDate)}
        </div>
      </CardBody>
    </Card>
  );
};

export default CalendarCell;
