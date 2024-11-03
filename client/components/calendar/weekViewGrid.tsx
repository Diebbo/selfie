"use client";

import React, { useState } from 'react';
import { SelfieEvent, ProjectModel } from "@/helpers/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

// Helper function to generate hours
const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    hours.push(`${hour}`);
  }
  return hours;
};

// Component to render hourly grid for a single day
export const WeekViewGrid: React.FC<{
  date: Date,
  events?: SelfieEvent[],
  isMobile: boolean,
  projects: ProjectModel[],
}> = ({ date, events, isMobile, projects }) => {
  const hours = generateHours();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedHourEvents, setSelectedHourEvents] = useState<SelfieEvent[]>([]);

  // Filter events for this specific date
  const dayEvents = events?.filter(event => {
    const eventDate = new Date(event.dtstart);
    return eventDate.toDateString() === date.toDateString();
  }) || [];
  const isMonday = date.getDay() === 0; // il primo giorno

  // Function to handle opening modal with events for a specific hour
  const handleOpenEventModal = (hourIndex: number) => {
    const eventsForHour = dayEvents.filter(event => {
      const eventStart = new Date(event.dtstart);
      return eventStart.getHours() === hourIndex;
    });

    setSelectedHourEvents(eventsForHour);
    onOpen();
  };

  return (
    <div className="overflow-y-auto scrollbar-hide max-h-[calc(85vh)]">
      {hours.map((hour, index) => {
        // Check if there's an event during this hour
        const eventsForHour = dayEvents.filter(event => {
          const eventStart = new Date(event.dtstart);
          const eventHour = eventStart.getHours();
          return eventHour === index;
        });
        const hasEvent = eventsForHour.length > 0;

        return (
          <div
            key={hour}
            className="border-b border-gray-200 dark:border-gray-700 h-10 relative flex items-center justify-between"
          >
            {isMonday && (
              <div className="left-2 w-2 text-xs text-gray-500 pr-2 text-left">
                {hour}
              </div>
            )}
            {hasEvent && (
              <Button
                size="sm"
                variant="light"
                className="mx-auto sm:w-full md:w-16 flex justify-center"
                onPress={() => handleOpenEventModal(index)}
              >
                EventIcon
              </Button>
            )}
          </div>
        );
      })}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Evento alle {selectedHourEvents[0] ?
                  new Date(selectedHourEvents[0].dtstart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </ModalHeader>
              <ModalBody>
                {selectedHourEvents.length > 0 ? (
                  selectedHourEvents.map((event, index) => (
                    <Button
                      key={index}
                      className="mb-2 border-1 border-default hover:border-secondary"
                      onClick={() => console.log("buttone")}
                    >
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-small text-default-500">
                        {new Date(event.dtstart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Button>
                  ))
                ) : (
                  <p>No events for this hour</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Chiudi
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
