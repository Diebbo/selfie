import { SelfieEvent, TaskModel, ProjectModel, ProjectTaskModel } from "@/helpers/types";
import { TaskMutiResponse } from "./api-types";
import { DayType, CombinedAppointment } from "./types";

const isInBetween = (date: Date, startDate: Date, endDate: Date): boolean => {
  return areSameDay(date, startDate) || areSameDay(date, endDate) || (date.getTime() >= startDate.getTime() && date.getTime() <= endDate.getTime());
}

const areSameDay = (dateA: Date, dateB: Date): boolean => {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}

const isAM = (date: Date): boolean => {
  return date.getHours() < 12;
};

const calculateFutureEvents = (event: SelfieEvent, date: Date): SelfieEvent[] => {
  const futureEvents: SelfieEvent[] = [];
  const rrule = event.rrule;
  if (!rrule) return futureEvents;

  const dtstart = new Date(event.dtstart);
  const dtend = new Date(event.dtend);
  const duration = dtend.getTime() - dtstart.getTime();
  const until = new Date(rrule.until? rrule.until : date);
  const freq = rrule.freq?.toUpperCase() || 'DAILY';
  const interval = rrule.interval;

  let current = new Date(dtstart);
  let count = 0;
  while (isInBetween(current, dtstart, until)) {
    // check if the repetition is in range
    if (rrule.count && count >= rrule.count) break;
    count++;
    const newEvent = {
      ...event,
      dtstart: new Date(current),
      dtend: new Date(current.getTime() + duration)
    };
    futureEvents.push(newEvent);

    // check if the repetition is by day
    if (rrule.byday) {
      const currentDay = current.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0,2) as DayType;
      const bydayDays = rrule.byday.map(dayObj => dayObj.day);
      if (bydayDays.includes(currentDay)) {
        current.setDate(current.getDate() + 1);
        continue;
      }
    }

    if (freq === 'YEARLY') {
      current.setFullYear(current.getFullYear() + interval);
    } else if (freq === 'MONTHLY') {
      current.setMonth(current.getMonth() + interval);
    } else if (freq === 'WEEKLY') {
      current.setDate(current.getDate() + 7 * interval);
    } else if (freq === 'DAILY') {
      current.setDate(current.getDate() + interval);
    } 
  }

  return futureEvents;
}

const getAppointmentsByDay = (events: SelfieEvent[] | undefined, projects: ProjectModel[], tasks: TaskMutiResponse | undefined, date: Date): CombinedAppointment[] => {
  const appointments: CombinedAppointment[] = [];

  // Add events
  if (Array.isArray(events)) {
    events.forEach(event => {
      const eventDateStart = new Date(event.dtstart);
      const eventDateEnd = new Date(event.dtend);

      // check if the repetition is in range
      if (event.rrule) {
        const futureEvents:SelfieEvent[] = calculateFutureEvents(event, date);
        futureEvents.forEach(futureEvent => {
          if (isInBetween(date, new Date(futureEvent.dtstart), new Date(futureEvent.dtend)))
            appointments.push({
              type: 'event',
              event: futureEvent
            });
        });
      } else if (
        isInBetween(date, eventDateStart, eventDateEnd)
      ) {
        appointments.push({
          type: 'event',
          event: event
        });
      }
    });
  }

  // Add projects
  if (Array.isArray(projects)) {
    projects.forEach(project => {
      const projectDeadline = new Date(project.deadline);
      const projectStartDate = new Date(project.startDate);

      if (isInBetween(date, projectStartDate, projectDeadline)) {
        appointments.push({
          type: 'project',
          project: project
        });
      }
      project.activities.forEach(task => {
        const taskDueDate = new Date(task.dueDate);
        if (areSameDay(date, taskDueDate)) {
          appointments.push({
            type: 'project-task',
            projectTask: task,
            projectId: project._id,
          });
        }
      });
    });
  }

  // Add tasks
  if (tasks && tasks.activities) {
    tasks.activities.forEach(task => {
      const taskDueDate = new Date(task.dueDate);
      if (areSameDay(date, taskDueDate)) {
        appointments.push({
          type: 'task',
          task: task
        });
      }

      if (task.subActivities) {
        task.subActivities.forEach(subTask => {
          const subTaskDueDate = new Date(subTask.dueDate);
          if (areSameDay(date, subTaskDueDate)) {
            appointments.push({
              type: 'task',
              task: subTask
            });
          }
        });
      }
    });
  }

  return appointments.sort((a, b) => {
    let dateA: Date, dateB: Date;
    switch (a.type) {
      case 'event':
        dateA = new Date(a.event!.dtstart);
        break;
      case 'project':
        dateA = new Date(a.project!.startDate);
        break;
      case 'task':
        dateA = new Date(a.task!.dueDate);
        break;
      case 'project-task':
        dateA = new Date(a.projectTask!.startDate);
        break;
    }
    switch (b.type) {
      case 'event':
        dateB = new Date(b.event!.dtstart);
        break;
      case 'project':
        dateB = new Date(b.project!.startDate);
        break;
      case 'task':
        dateB = new Date(b.task!.dueDate);
        break;
      case 'project-task':
        dateB = new Date(b.projectTask!.startDate);
        break;
    }
    const aIsAM = isAM(dateA);
    const bIsAM = isAM(dateB);
    if (aIsAM && !bIsAM) return -1;
    if (!aIsAM && bIsAM) return 1;
    return dateA.getTime() - dateB.getTime();
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatEventTime = (event: SelfieEvent): string => {
  const eventDate = new Date(event.dtstart);
  return eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

export {
  getAppointmentsByDay,
  formatDate,
  formatEventTime,
  calculateFutureEvents,
  isInBetween
};
