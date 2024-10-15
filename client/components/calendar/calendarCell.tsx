"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { SelfieEvent } from "@/helpers/types";

const areSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getEventsByDay = (
  events: SelfieEvent[] | undefined,
  date: Date,
): SelfieEvent[] => {
  if (!Array.isArray(events)) {
    return []; // Restituisci un array vuoto invece di lanciare un errore
  }

  return events.filter((event) => {
    const eventDate = new Date(event.dtstart);
    return areSameDay(eventDate, date);
  });
};

const showEvents = (
  events: SelfieEvent[] | undefined,
  date: Date,
): JSX.Element[] => {
  const todayEvents = getEventsByDay(events, date);
  return todayEvents.map((event, index) => (
    <button
      key={index}
      className="rounded-[100px] py-2 px-4 border-1 border-black bg-slate-700 text-left text-white w-full overflow-hidden truncate dark:hover:border-1 dark:hover:border-white"
    >
      {event.title}
    </button>
  ));
};

interface CalendarCellProps {
  day: number;
  date: Date;
  isToday: boolean;
  events?: SelfieEvent[];
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  day,
  date,
  isToday,
  events = [], // Questo già fornisce un default, ma assicuriamoci che sia un array
}) => {
  const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
  const safeEvents = Array.isArray(events) ? events : [];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<SelfieEvent | null>(null);

  const handleEventClick = (event: SelfieEvent) => {
    setSelectedEvent(event);
    onOpen();
  };

  return (
    <Card>
      <CardBody className="p-0 flex flex-col bg-white dark:bg-black">
        <div
          className={`p-2 px-4 text-right rounded-[100px] bg-slate-800 text-sm font-bold ${isToday ? "text-slate-300 bg-blue-800 border-2 border-slate-300" : "text-white dark:text-white"}`}
        >
          {day}
        </div>
        <div className="mt-1 space-y-1 overflow-hidden">
          {getEventsByDay(safeEvents, cellDate).map((event, index) => (
            <Tooltip
              key={index}
              placement="bottom"
              closeDelay={0}
              showArrow={true}
              classNames={{ base: "pointer-events-none" }}
              content={
                <div>
                  <p>
                    <strong>Description:</strong>{" "}
                    {event.description || "No description"}
                  </p>
                  <p>
                    <strong>Location 📍:</strong>{" "}
                    {event.location || "No location specified"}
                  </p>
                </div>
              }
            >
              <button
                onClick={() => handleEventClick(event)}
                className="rounded-[100px] py-2 px-4 border-1 border-black bg-slate-700 text-left text-white w-full overflow-hidden truncate dark:hover:border-1 dark:hover:border-white"
              >
                {event.title}
              </button>
            </Tooltip>
          ))}
        </div>
      </CardBody>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedEvent?.title}
              </ModalHeader>
              <ModalBody>
                <p>
                  <strong>Description:</strong> {selectedEvent?.description}
                </p>
                <p>
                  <strong>Start:</strong>{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedEvent?.dtstart as Date))}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedEvent?.dtend as Date))}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default CalendarCell;
