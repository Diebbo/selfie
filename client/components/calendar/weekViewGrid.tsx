"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { SelfieEvent, ProjectModel, TaskModel } from "@/helpers/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Chip, Input } from "@nextui-org/react";
import { useTime } from "../contexts/TimeContext";

interface CombinedAppointment {
  type: 'event' | 'project' | 'task';
  event?: SelfieEvent;
  project?: ProjectModel;
  task?: TaskModel;
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
  tasks: TaskModel[] | undefined,
}> = ({ date, events = [], isMobile, projects = [], tasks }) => {
  const { currentTime } = useTime();
  const hours = generateHours();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedHourAppointments, setSelectedHourAppointments] = useState<CombinedAppointment[]>([]);
  const router = useRouter();
  const [isToday, setToday] = useState(currentTime);

  // Combine events, project tasks and tasks for the specific date
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

    // Add individual tasks
    if (tasks) {
      tasks.forEach(task => {
        const taskDate = new Date(task.dueDate);
        if (taskDate.toDateString() === date.toDateString()) {
          appointments.push({
            type: 'task',
            task
          });
        }
      });
    }

    return appointments;
  };

  const handleOpenAppointmentModal = (hourIndex: number) => {
    const appointmentsForHour = getDayAppointments().filter(appointment => {
      const appointmentDate = appointment.type === 'event'
        ? new Date(appointment.event!.dtstart)
        : appointment.type === 'project'
          ? new Date(appointment.project!.activities[0].dueDate)
          : new Date(appointment.task!.dueDate);
      return appointmentDate.getHours() === hourIndex;
    });

    setSelectedHourAppointments(appointmentsForHour);
    onOpen();
  };

  const getAppointmentsForHour = (hourIndex: number): CombinedAppointment[] => {
    return getDayAppointments().filter(appointment => {
      const appointmentDate = appointment.type === 'event'
        ? new Date(appointment.event!.dtstart)
        : appointment.type === 'project'
          ? new Date(appointment.project!.activities[0].dueDate)
          : new Date(appointment.task!.dueDate);
      return appointmentDate.getHours() === hourIndex;
    });
  };

  const renderAppointmentButton = (appointments: CombinedAppointment[]) => {
    const count = appointments.length;
    const hasEvents = appointments.some(a => a.type === 'event');
    const hasProjects = appointments.some(a => a.type === 'project');
    const hasTasks = appointments.some(a => a.type === 'task');

    function handleColor() {
      if (hasProjects && hasTasks && hasEvents) {
        return "bg-secondary-400";
      } else if (hasEvents) {
        return "bg-primary-400";
      } else {
        return "bg-warning-400";
      }
    }

    return (
      <Button
        size="sm"
        variant="light"
        className={`${isMobile ? "w-[calc(95vw/7)] min-w-0" : "sm:w-full md:w-16"} 
          ${count > 2 ? "bg-danger-300" : "bg-warning-300"} text-10 mx-auto flex justify-center items-center gap-1
          ${handleColor}`}

        aria-label={count > 2 ? "tooManyAppoinments" : ""}
        onPress={() => handleOpenAppointmentModal(parseInt(appointments[0].type === 'event'
          ? new Date(appointments[0].event!.dtstart).getHours().toString()
          : appointments[0].type === 'project'
            ? new Date(appointments[0].project!.activities[0].dueDate).getHours().toString()
            : new Date(appointments[0].task!.dueDate).getHours().toString()))}
      >
        {(hasEvents || hasTasks || hasProjects) &&
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M600-80v-80h160v-400H200v160h-80v-320q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H600ZM320 0l-56-56 103-104H40v-80h327L264-344l56-56 200 200L320 0ZM200-640h560v-80H200v80Zm0 0v-80 80Z" /></svg>
        }
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
        const isCurrentHour = isToday.getDate() && isToday.getDay() === index;

        return (
          <div
            key={hour}
            className={`relative border-b border-gray-200 dark:border-gray-700 h-10 relative flex items-center justify-between
              ${isCurrentHour ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
          >
            <div className={`absolute z-10 left-0 w-2 rounded-[40px] w-4 text-xs pr-2 text-left
              ${isCurrentHour ? 'text-primary-500 font-bold' : 'text-gray-500 font-semibold'}`}>
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
                        : selectedHourAppointments[0].type === 'project'
                          ? selectedHourAppointments[0].project!.activities[0].dueDate
                          : selectedHourAppointments[0].task!.dueDate
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
                            : appointment.type === 'project'
                              ? `/projects/${appointment.project!._id}`
                              : `/task`
                        )}
                      >
                        <div className="flex flex-row items-start w-full">
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              color={appointment.type === 'event' ? 'primary' : appointment.type === 'project' ? 'warning' : 'secondary'}
                              variant="flat"
                            >
                              {appointment.type === 'event' ? 'Evento' : appointment.type === 'project' ? 'Progetto' : 'Task'}
                            </Chip>
                            <p className="font-semibold">
                              {appointment.type === 'event'
                                ? appointment.event!.title
                                : `${appointment.project!.title} - ${appointment.project!.activities[0].title}`}
                            </p>
                            <p className="text-small text-default-500 justify-end">
                              {new Date(
                                appointment.type === 'event'
                                  ? appointment.event!.dtstart
                                  : appointment.type === 'project'
                                    ? appointment.project!.activities[0].dueDate
                                    : appointment.task!.dueDate
                              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </Button>
                      {renderParticipants(appointment)}
                    </div>
                  ))
                ) : (
                  <p>Nessun appuntamento</p>
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
