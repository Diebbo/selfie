"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { SelfieEvent, ProjectModel, TaskModel } from "@/helpers/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Chip, Input } from "@nextui-org/react";

interface CombinedAppointment {
  type: 'event' | 'project';
  event?: SelfieEvent;
  project?: ProjectModel;
}

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    hours.push(`${hour}`);
  }
  return hours;
};

export const WeekViewGrid: React.FC<{
  date: Date,
  events?: SelfieEvent[],
  isMobile: boolean,
  projects: ProjectModel[],
}> = ({ date, events = [], isMobile, projects = [] }) => {
  const hours = generateHours();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedHourAppointments, setSelectedHourAppointments] = useState<CombinedAppointment[]>([]);
  const router = useRouter();
  const currentHour = new Date().getHours();
  const isToday = date.toDateString() === new Date().toDateString();

  // Combine events and project tasks for the specific date
  const getDayAppointments = (): CombinedAppointment[] => {
    const appointments: CombinedAppointment[] = [];

    // Add events
    events.forEach(event => {
      const eventDate = new Date(event.dtstart);
      if (eventDate.toDateString() === date.toDateString()) {
        appointments.push({
          type: 'event',
          event
        });
      }
    });

    // Add project tasks
    projects.forEach(project => {
      project.activities.forEach(task => {
        const taskDate = new Date(task.dueDate);
        if (taskDate.toDateString() === date.toDateString()) {
          appointments.push({
            type: 'project',
            project: {
              ...project,
              activities: [task] // Include only the relevant task
            }
          });
        }
      });
    });

    return appointments;
  };

  const handleOpenAppointmentModal = (hourIndex: number) => {
    const appointmentsForHour = getDayAppointments().filter(appointment => {
      const appointmentDate = appointment.type === 'event'
        ? new Date(appointment.event!.dtstart)
        : new Date(appointment.project!.activities[0].dueDate);
      return appointmentDate.getHours() === hourIndex;
    });

    setSelectedHourAppointments(appointmentsForHour);
    onOpen();
  };

  const getAppointmentsForHour = (hourIndex: number): CombinedAppointment[] => {
    return getDayAppointments().filter(appointment => {
      const appointmentDate = appointment.type === 'event'
        ? new Date(appointment.event!.dtstart)
        : new Date(appointment.project!.activities[0].dueDate);
      return appointmentDate.getHours() === hourIndex;
    });
  };

  const renderAppointmentButton = (appointments: CombinedAppointment[]) => {
    const count = appointments.length;
    const hasEvents = appointments.some(a => a.type === 'event');
    const hasProjects = appointments.some(a => a.type === 'project');

    return (
      <Button
        size="sm"
        variant="light"
        className={`${isMobile ? "w-[calc(95vw/7)] min-w-0" : "sm:w-full md:w-16"}  ${count > 1 ? "bg-danger-300" : "bg-primary-300"} text-10 mx-auto flex justify-center items-center gap-1
          ${hasEvents && hasProjects ? 'bg-purple-200' :
            hasProjects ? 'bg-warning-200' :
              'bg-default-200'}`}
        onPress={() => handleOpenAppointmentModal(parseInt(appointments[0].type === 'event'
          ? new Date(appointments[0].event!.dtstart).getHours().toString()
          : new Date(appointments[0].project!.activities[0].dueDate).getHours().toString()))}
      >
        {hasEvents && "📋"}
        {hasProjects && "📁"}
      </Button>
    );
  };

  // Helper function to render participants
  const renderParticipants = (appointment: CombinedAppointment) => {
    if (appointment.type !== 'project') return

    const participants = appointment.project!.members ?? [];
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-small text-default-500">Partecipanti:</span>
        <Input
          isReadOnly
          value={[participants.map(p => p.toString())].join(", ")}
        />
        {participants.length > 3 && (
          <span className="text-small text-default-500">
            +{participants.length - 3} altri
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-y-auto scrollbar-hide max-h-[calc(85vh)]">
      {hours.map((hour, index) => {
        const appointmentsForHour = getAppointmentsForHour(index);
        const hasAppointments = appointmentsForHour.length > 0;
        const isCurrentHour = isToday && currentHour === index;

        return (
          <div
            key={hour}
            className={`border-b border-gray-200 dark:border-gray-700 h-10 relative flex items-center justify-between
              ${isCurrentHour ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
          >
            <div className={`z-10 left-2 w-2 text-xs pr-2 text-left
              ${isCurrentHour ? 'text-primary-500 font-bold' : 'text-gray-500'}`}>
              {hour}
            </div>
            {hasAppointments && renderAppointmentButton(appointmentsForHour)}
          </div>
        );
      })}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedHourAppointments.length > 0 && (
                  <span>
                    Appuntamenti alle {new Date(
                      selectedHourAppointments[0].type === 'event'
                        ? selectedHourAppointments[0].event!.dtstart
                        : selectedHourAppointments[0].project!.activities[0].dueDate
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedHourAppointments.length > 0 ? (
                  selectedHourAppointments.map((appointment, index) => (
                    <div key={index} className="mb-4">
                      <Button
                        className="mb-2 p-[2rem] border-1 border-default hover:border-secondary w-full"
                        onClick={() => router.push(
                          appointment.type === 'event'
                            ? `/calendar/${appointment.event!._id}`
                            : `/projects/${appointment.project!._id}`
                        )}
                      >
                        <div className="flex flex-row items-start w-full">
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              color={appointment.type === 'event' ? 'primary' : 'warning'}
                              variant="flat"
                            >
                              {appointment.type === 'event' ? 'Evento' : 'Progetto'}
                            </Chip>
                            <p className="font-semibold">
                              {appointment.type === 'event'
                                ? appointment.event!.title
                                : `${appointment.project!.title} - ${appointment.project!.activities[0].name}`}
                            </p>
                            <p className="text-small text-default-500 justify-end">
                              {new Date(
                                appointment.type === 'event'
                                  ? appointment.event!.dtstart
                                  : appointment.project!.activities[0].dueDate
                              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </Button>
                      {renderParticipants(appointment)}
                    </div>
                  ))
                ) : (
                  <p>Nessun appuntamento per quest'ora</p>
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
