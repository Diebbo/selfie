// FORMS
export interface ChatModel {
  uid: string;
  username: string;
  lastMessage: MessageModel;
  avatar: string;
}

export interface MessageModel {
  _id?: string;
  message: string;
  sender: string;
  receiver: string;
  createdAt: Date;
  status: "sent" | "delivered" | "read";
}

export enum StatusEnum {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export interface NoteModel {
  _id?: string;
  title: string;
  content: string;
  date?: Date;
  tags: string[];
}

export type LoginFormType = {
  email: string;
  password: string;
};

export interface RegisterType {
  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;

  birthDate: Date;

  phoneNumber?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface RegisterFormType extends RegisterType {
  confirmPassword: string;
}

// EVENTS
export interface Person extends RegisterType {
  _id: string;
  avatar: string; // URL
  friends: Person[]; // is this performance frinedly?
  events: {
    created: SelfieEvent[];
    participating: SelfieEvent[];
  };
  notes: NoteModel[];
  projects: ProjectModel[];
  pomodoro: {
    totalStudyTime: number;
    totalBreakTime: number;
  };
  position: {
    latitude: number;
    longitude: number;
  };
}

export type People = Person[];

export type FrequencyType = "daily" | "weekly" | "monthly" | "yearly";

export type DayType = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export type PositionType = -1 | 1 | 2 | 3 | 4 | 5;

export interface RRule {
  freq: FrequencyType;
  interval: number;
  until?: Date;
  count?: number;
  bymonth?: number;
  bymonthday?: number;
  byday?: Array<{
    day: DayType;
    position?: PositionType;
  }>;
}

export interface SelfieEvent {
  title: String;
  summary: String;
  uid: String | Number;
  sequence: Number;
  status: String;
  transp: String;
  isRrule: boolean;
  rrule: RRule;
  dtstart: Date;
  dtend: Date;
  dtstamp: String;
  allDay: Boolean;
  categories: String[];
  location: String;
  geo: {
    lat: Number;
    lon: Number;
  };
  description: String;
  URL: String;
  participants: string[];
  notification: SelfieNotification;
  _id: string;
}

export interface SelfieNotification {
  title: String;
  description: String;
  type: String;
  repetition: {
    freq: String; // minutely, hourly, daily, weekly, monthly, yearly
    interval: Number; // every x minutes/hours/days/weeks/months/years
  };
  fromDate: Date; // anticipo rispetto a data evento
}

export interface PomodoroSettings {
  studyDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

export interface PomodoroStats {
  totalStudyTime: number;
  totalBreakTime: number;
}

export interface Song {
  title: string;
  album: string;
  duration: number;
  cover: string;
  id: string;
  liked: boolean;
}
/*
 *       setFocusTimeInput(data.studyDuration);
      setBreakTimeInput(data.shortBreakDuration);
      setLongBreakTimeInput(data.longBreakDuration);
      setTimeLeft(data.studyDuration * 60);
      setFocusTime(data.studyDuration);
      setBreakTime(data.shortBreakDuration);
*/

interface Task {
  _id: string;
  title: string;
  dueDate: Date;

}

export interface TaskModel {
  _id: string;
  name: string;
  dueDate: Date;
  completed: boolean;
  participants: string[]; // Usernames
  subActivities: TaskModel[];
  uid: string; // User ID
  parentId?: any; // You might want to define this more specifically based on your needs
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

interface ProjectTaskModel extends Task {
  description: string;
  status: TaskStatus;
  participants: string[]; // Usernames
  subTasks: ProjectTaskModel[];
}

export interface ProjectModel {
  _id: string;
  title: string;
  description: string;
  activities: ProjectTaskModel[];
  creator: Person; // creator id
  members: Person[]; // particapants usernames
  creationDate: Date;
  deadline: Date;
}

export interface ResourceModel {
  name: string;
  used: [{
    startTime: Date,
    endTime: Date,
    claimant: string,
  }];
}

