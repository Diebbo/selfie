"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { SelfieEvent, ProjectModel, TaskModel, ProjectTaskModel } from "@/helpers/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Chip, Input } from "@nextui-org/react";
import { useTime } from "../contexts/TimeContext";
import { calculateFutureEvents, isInBetween } from '@/helpers/calendar';

enum AppointmentChipColor {
  EVENT = 'primary',
  PROJECT = 'warning',
  TASK = 'secondary',
  PROJECT_TASK = 'danger',
}

enum CompressedAppointmentButtonColor {
  ALL = 'bg-danger-300',
  EVENT = 'bg-primary-300',
  PROJECT = 'bg-warning-300',
  TASK = 'bg-secondary-300',
}

interface CombinedAppointment {
  type: 'event' | 'project' | 'task' | 'project-task';
  event?: SelfieEvent;
  project?: ProjectModel;
  task?: TaskModel;
  projectTask?: ProjectTaskModel;
  startTime: Date;
  endTime: Date;
}

const WeekViewGrid: React.FC<{
  date: Date,
  events?: SelfieEvent[],
  isMobile: boolean,
  projects: ProjectModel[],
  tasks: TaskModel[] | undefined,
}> = ({ date, events = [], isMobile, projects = [], tasks }) => {
  const { currentTime } = useTime();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedHourAppointments, setSelectedHourAppointments] = useState<CombinedAppointment[]>([]);
  const [isToday, setToday] = useState(currentTime);

  useEffect(() => {
    setToday(currentTime);
  }, [currentTime]);

  // Helper function to generate hours for the grid
  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hours.push(`${hour}`);
    }
    return hours;
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  // Helper function to get the date and times of an appointment
  const getAppointmentTimes = (appointment: Omit<CombinedAppointment, 'startTime' | 'endTime'>): { startTime: Date, endTime: Date } => {
    let startTime, endTime;

    switch (appointment.type) {
      case 'event':
        startTime = new Date(appointment.event!.dtstart);
        // If event has dtend use it, otherwise set end time to start time + 1 hour
        endTime = appointment.event!.dtend ? new Date(appointment.event!.dtend) : new Date(startTime.getTime() + 3600000);
        break;
      case 'project':
        startTime = new Date(appointment.project!.deadline);
        endTime = new Date(startTime.getTime() + 3600000); // Add 1 hour for projects
        break;
      case 'task':
        startTime = new Date(appointment.task!.dueDate);
        endTime = new Date(startTime.getTime() + 3600000); // Add 1 hour for tasks
        break;
      case 'project-task':
        startTime = new Date(appointment.projectTask!.dueDate);
        endTime = new Date(startTime.getTime() + 3600000); // Add 1 hour for project tasks
        break;
    }
    return { startTime, endTime };
  };

  // Helper function to get appointment name
  const getAppointmentName = (appointment: CombinedAppointment) => {
    switch (appointment.type) {
      case 'event':
        return appointment.event!.title;
      case 'project':
        return appointment.project!.title;
      case 'task':
        return appointment.task!.name;
      case 'project-task':
        return appointment.projectTask!.title;
    }
  };

  // Helper function to handle redirects
  const handleRedirect = (appointment: CombinedAppointment) => {
    switch (appointment.type) {
      case 'event':
        return `/calendar/${appointment.event!._id}`;
      case 'project':
        return `/projects/${appointment.project!._id}`;
      case 'task':
        return `/task`;
      case 'project-task':
        return `/projects/${appointment.project?._id}`;
    }
  };

  // Helper function to render participants
  const renderParticipants = (appointment: CombinedAppointment) => {
    if (appointment.type !== 'project') return null;

    const participants = appointment.project!.members ?? [];
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-small text-default-500">Partecipanti:</span>
        <Input
          isReadOnly
          value={participants.map(p => p.toString()).join(", ")}
        />
        {participants.length > 3 && (
          <span className="text-small text-default-500">
            +{participants.length - 3} altri
          </span>
        )}
      </div>
    );
  };

  // Helper function to get appointments for a specific day
  const getDayAppointments = (): CombinedAppointment[] => {
    const appointments: CombinedAppointment[] = [];

    // Add events
    events.forEach(event => {
      const eventDate = new Date(event.dtstart);
      if (event.rrule) {
        const futureEvents: SelfieEvent[] = calculateFutureEvents(event, date);
        futureEvents.forEach(futureEvent => {
          if (isInBetween(date, new Date(futureEvent.dtstart), new Date(futureEvent.dtend))) {
            const times = getAppointmentTimes({ type: 'event', event: futureEvent });
            appointments.push({
              type: 'event',
              event: futureEvent,
              ...times
            });
          }
        });
      } else {
        if (isInBetween(date, eventDate, new Date(event.dtend))) {
          const times = getAppointmentTimes({ type: 'event', event });
          appointments.push({
            type: 'event',
            event,
            ...times
          });
        }
      }

    });

    // Add project tasks
    projects.forEach(project => {
      if (isSameDay(date, new Date(project.deadline))) {
        const times = getAppointmentTimes({ type: 'project', project });
        appointments.push({
          type: 'project',
          project,
          ...times
        });
      }
      project.activities.forEach(task => {
        const taskDate = new Date(task.dueDate);
        if (isSameDay(date, taskDate)) {
          const times = getAppointmentTimes({ type: 'project-task', projectTask: task, project });
          appointments.push({
            type: 'project-task',
            projectTask: task,
            project,
            ...times
          });
        }
      });
    });

    // Add individual tasks
    if (tasks) {
      tasks.forEach(task => {
        const taskDate = new Date(task.dueDate);
        if (taskDate.toDateString() === date.toDateString()) {
          const times = getAppointmentTimes({ type: 'task', task });
          appointments.push({
            type: 'task',
            task,
            ...times
          });
        }
      });
    }

    return appointments;
  };

  // Helper function to get appointments for a specific hour
  const getAppointmentsForHour = (hourIndex: number): CombinedAppointment[] => {
    return getDayAppointments().filter(appointment => {
      const hourStart = new Date(date);
      hourStart.setHours(hourIndex, 0, 0, 0);
      const hourEnd = new Date(date);
      hourEnd.setHours(hourIndex + 1, 0, 0, 0);

      return appointment.startTime <= hourEnd && appointment.endTime > hourStart;
    });
  };

  // Helper function to handle opening the appointment modal
  const handleOpenAppointmentModal = (hourIndex: number) => {
    const appointmentsForHour = getAppointmentsForHour(hourIndex);
    setSelectedHourAppointments(appointmentsForHour);
    onOpen();
  };

  // Helper function to get chip color
  const getChipColor = (appointmentType: CombinedAppointment['type']) => {
    switch (appointmentType) {
      case 'event':
        return AppointmentChipColor.EVENT;
      case 'project':
        return AppointmentChipColor.PROJECT;
      case 'task':
        return AppointmentChipColor.TASK;
      case 'project-task':
        return AppointmentChipColor.PROJECT_TASK;
    }
  };

  const renderEmoji = (appointmentType: CombinedAppointment['type']) => {
    switch (appointmentType) {
      case 'event':
        return '📅';
      case 'project':
        return '📝';
      case 'task':
        return '📌';
      case 'project-task':
        return '📌';
    }
  }

  // Helper function to render appointment button
  const renderAppointmentButton = (appointments: CombinedAppointment[]) => {
    const hasEvents = appointments.some(a => a.type === 'event');
    const hasProjects = appointments.some(a => a.type === 'project' || a.type === 'project-task');
    const hasTasks = appointments.some(a => a.type === 'task');

    const getButtonColor = () => {
      if (hasEvents && hasProjects && hasTasks) {
        return CompressedAppointmentButtonColor.ALL;
      } else if (hasEvents) {
        return CompressedAppointmentButtonColor.EVENT;
      } else if (hasTasks) {
        return CompressedAppointmentButtonColor.TASK;
      } else if (hasProjects) {
        return CompressedAppointmentButtonColor.PROJECT;
      }
      return CompressedAppointmentButtonColor.ALL;
    };

    return (
      <Button
        size="sm"
        variant="light"
        className={`${isMobile ? "w-[calc(95vw/7)] min-w-0" : "sm:w-full md:w-16"} 
          ${getButtonColor()} text-10 mx-auto flex justify-center items-center gap-1`}
        aria-label={appointments.length > 2 ? "tooManyAppoinments" : ""}
        onPress={() => handleOpenAppointmentModal(appointments[0].startTime.getHours())}
      >
        {(hasEvents || hasTasks || hasProjects) &&
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <path d="M600-80v-80h160v-400H200v160h-80v-320q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H600ZM320 0l-56-56 103-104H40v-80h327L264-344l56-56 200 200L320 0ZM200-640h560v-80H200v80Zm0 0v-80 80Z" />
          </svg>
        }
      </Button>
    );
  };

  const hours = generateHours();

  return (
    <div className="overflow-y-auto scrollbar-hide max-h-[calc(77vh)]">
      {hours.map((hour, index) => {
        const appointmentsForHour = getAppointmentsForHour(index);
        const hasAppointments = appointmentsForHour.length > 0;
        const isCurrentHour = isSameDay(date, isToday) && currentTime.getHours() === index;

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
                    Appuntamenti alle {selectedHourAppointments[0].startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedHourAppointments.length > 0 ? (
                  selectedHourAppointments.map((appointment, index) => (
                    <div key={index} className="mb-4">
                      <Button
                        className={`mb-2 p-[2rem] border-1 border-default hover:border-black w-full bg-${getChipColor(appointment.type)}-100`}
                        onClick={() => router.push(handleRedirect(appointment))}
                      >
                        <div className="flex flex-row items-start w-full">
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              color={getChipColor(appointment.type)}
                              variant="flat"
                            >
                              {
                                renderEmoji(appointment.type) + " " +
                                appointment.type.charAt(0).toUpperCase().concat(appointment.type.slice(1).replace('-', ' '))
                              }
                            </Chip>
                            <p className="font-semibold">
                              {getAppointmentName(appointment)}
                            </p>
                            <p className="text-small text-default-500 justify-end">
                              {appointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                              {appointment.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </Button>
                      {renderParticipants(appointment)}
                    </div>
                  ))
                ) : (
                  <p>No appointment</p>
                )}
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
    </div>
  );
};

export default WeekViewGrid; 
