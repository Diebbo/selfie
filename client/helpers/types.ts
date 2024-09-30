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
}

export type People = Person[];

export interface SelfieEvent {
    title: String,
    summary: String,
    uid: String,
    sequence: Number,
    status: {
        type: String,
        enum: ['confirmed', 'tentative', 'cancelled']
    },
    transp: String,
    rrule: {
        freq: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: Number,
        bymonth: Number,
        bymonthday: Number
    },
    dtstart: Date,
    dtend: Date,
    dtstamp: String,
    categories: [String],
    location: String,
    geo: [Number],
    description: String,
    URL: String,
    participants: People,
}
