import { People, SelfieEvent } from "./types";

const dummyPeople: People = [
  {
    id: "1",
    avatar: "https://example.com/avatar1.jpg",
    friends: [],
    name: "Alice",
    surname: "Johnson",
    email: "alice@example.com",
    phoneNumber: "123-456-7890",
    username: "alice",
    password: "password",
    birthDate: new Date("1990-01-01"),
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    country: "USA",
  },
  {
    id: "2",
    avatar: "https://example.com/avatar2.jpg",
    friends: [],
    name: "Bob",
    surname: "Smith",
    email: "bob@example.com",
    phoneNumber: "234-567-8901",
    username: "bob",
    password: "password",
    birthDate: new Date("1985-05-15"),
    address: "456 Elm St",
    city: "Shelbyville",
    state: "IL",
    zip: "62565",
    country: "USA",
  },
  {
    id: "3",
    avatar: "https://example.com/avatar3.jpg",
    friends: [],
    name: "Charlie",
    surname: "Brown",
    email: "charlie@example.com",
    phoneNumber: "345-678-9012",
    username: "charlie",
    password: "password",
    birthDate: new Date("1988-09-30"),
    address: "789 Oak St",
    city: "Capital City",
    state: "IL",
    zip: "62701",
    country: "USA",
  },
  {
    id: "4",
    avatar: "https://example.com/avatar4.jpg",
    friends: [],
    name: "Diana",
    surname: "Prince",
    email: "diana@example.com",
    phoneNumber: "456-789-0123",
    username: "diana",
    password: "password",
    birthDate: new Date("1992-07-01"),
    address: "101 Pine St",
    city: "Ogdenville",
    state: "IL",
    zip: "62271",
    country: "USA",
  },
];

// Set up friend relationships
dummyPeople[0].friends = [dummyPeople[1], dummyPeople[2]];
dummyPeople[1].friends = [dummyPeople[0], dummyPeople[3]];
dummyPeople[2].friends = [dummyPeople[0], dummyPeople[3]];
dummyPeople[3].friends = [dummyPeople[1], dummyPeople[2]];

const dummyEvents: SelfieEvent[] = [
  {
    name: "Beach Party",
    participants: [dummyPeople[0], dummyPeople[1], dummyPeople[2]],
    creator: dummyPeople[0],
    dateFrom: new Date("2024-08-15T14:00:00"),
    dateTo: new Date("2024-08-15T20:00:00"),
  },
  {
    name: "Movie Night",
    participants: [dummyPeople[1], dummyPeople[3]],
    creator: dummyPeople[1],
    dateFrom: new Date("2024-08-20T19:00:00"),
    dateTo: new Date("2024-08-20T23:00:00"),
  },
  {
    name: "Picnic in the Park",
    participants: dummyPeople,
    creator: dummyPeople[2],
    dateFrom: new Date("2024-08-25T12:00:00"),
    dateTo: new Date("2024-08-25T16:00:00"),
  },
];

const exportObj = { dummyPeople, dummyEvents };

export default exportObj;
