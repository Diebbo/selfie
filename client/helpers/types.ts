// FORMS
export interface ChatModel {
  uid: string;
  username: string;
  lastMessage: string;
  date: Date;
}

export interface MessageModel {
  _id: string;
  message: string;
  sender: string;
  receiver: string;
  createdAt: Date;
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
}

export type People = Person[];

export type FrequencyType = "daily" | "weekly" | "monthly" | "yearly";

export interface SelfieEvent {
  title: String;
  summary: String;
  uid: String;
  sequence: Number;
  status: String;
  transp: String;
  rrule: {
    freq: FrequencyType;
    interval: Number;
    bymonth: Number;
    bymonthday: Number;
  };
  dtstart: Date;
  dtend: Date;
  dtstamp: String;
  categories: String[];
  location: String;
  geo: {
    lat: Number;
    lon: Number;
  };
  description: String;
  URL: String;
  participants: People;
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

export interface Song {
  title: string;
  album: string;
  duration: string;
  progress: string;
  cover: string;
  id?: string;
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

export interface TaskModel {
  name: string;
  dueDate: Date;
  completed: boolean;
  participants: any[]; // id array of users
  subActivity: any; // Assuming subActivities are references to other Activities
  uid: string; // User ID
  parentId?: any; // You might want to define this more specifically based on your needs
}

export interface ProjectModel {
  _id: string;
  title: string;
  description: string;
  activities: TaskModel[];
  creator: Person;
  participants: People;
  creationDate: Date;
  deadline: Date;
}
