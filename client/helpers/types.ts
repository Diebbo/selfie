// FORMS

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
  id: string;
  avatar: string; // URL
  friends: Person[]; // is this performance frinedly?
}

export type People = Person[];

export interface SelfieEvent {
  name: string;
  participants: People;
  creator: Person;
  dateFrom: Date;
  dateTo: Date;
}
