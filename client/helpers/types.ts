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

export interface SelfieEvent {
  title: String;
  summary: String;
  uid: String;
  sequence: Number;
  status: String;
  transp: String;
  rrule: {
    freq: {
      type: String;
      enum: ["daily", "weekly", "monthly", "yearly"];
    };
    interval: Number;
    bymonth: Number;
    bymonthday: Number;
  };
  dtstart: Date;
  dtend: Date;
  dtstamp: String;
  categories: [String];
  location: String;
  geo: [Number];
  description: String;
  URL: String;
  participants: People;
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
