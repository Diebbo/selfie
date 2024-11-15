"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../table/table";
import { EventCard } from "./event-card";
import { CardFriends } from "./card-friends";
import { Link, Button } from "@nextui-org/react";
import NextLink from "next/link";
import { useTime } from "../contexts/TimeContext";

import {
  PomodoroStats,
  SelfieEvent,
  Person,
  ProjectModel,
  NoteModel,
} from "@/helpers/types";
import { CardChats } from "./card-chats";
import { People } from "@/helpers/types";
import { PomodoroStatistics } from "./pomodoro-stats";
import { ProjectTable } from "./project-table";
import NoteCard from "../notes/NoteCard";
import WeatherCard from "./WeatherCard";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { useRouter } from "next/navigation";

interface UserEvents {
  created: SelfieEvent[];
  participating: SelfieEvent[];
}

interface ContentProps {
  chats: any[];
  notes: any[];
  pomodoro: PomodoroStats;
  projects: ProjectModel[];
  events: UserEvents;
  user: Person;
}

export const Content = (props: ContentProps): ReactJSXElement => {
  const [eventType, setEventType] = useState<"your" | "group">("your");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "all">(
    "today",
  );
  const [user] = useState<Person>(props.user);
  const [notes] = useState<NoteModel[]>(props.notes);
  const [friends, setFriends] = useState<People | null>(props.user.friends);
  const [showPublicNotes, setShowPublicNotes] = useState(false);
  const { currentTime } = useTime();
  const router = useRouter();

  const filterEvents = (
    events: SelfieEvent[],
    filter: "today" | "week" | "all",
  ) => {
    if (!Array.isArray(events)) return [];

    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0); // Imposta l'ora a mezzanotte

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999); // Imposta l'ora a fine giornata

    return events.filter((event) => {
      // Ignora eventi cancellati
      if (event.status === "CANCELLED") return false;

      const eventStart = new Date(event.dtstart);
      const eventEnd = new Date(event.dtend);

      switch (filter) {
        case "today":
          // Un evento è considerato "di oggi" se:
          // - inizia oggi
          // - è in corso (è iniziato prima di oggi ma finisce dopo)
          return (
            eventStart.toDateString() === today.toDateString() ||
            (eventStart <= today && eventEnd >= today)
          );
        case "week":
          // Un evento è considerato "della settimana" se:
          // - inizia questa settimana
          // - è in corso durante la settimana
          return (
            (eventStart >= today && eventStart <= weekEnd) ||
            (eventStart <= today && eventEnd >= today)
          );
        default:
          return true;
      }
    });
  };

  const filteredNotes = notes?.filter((note) =>
    showPublicNotes ? note.isPublic === true : !note.isPublic,
  );

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-5 pt-4 px-4 xl:px-3 2xl:px-5 flex-wrap xl:flex-nowrap max-w-[100rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Card Section Top */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div className="flex flex-col border rounded-lg p-4 h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="px-2 min-w-10"
                    variant={eventType === "your" ? "solid" : "flat"}
                    color="primary"
                    onClick={() => setEventType("your")}
                  >
                    Your Events
                  </Button>
                  <Button
                    size="sm"
                    className="px-2 min-w-10"
                    variant={eventType === "group" ? "solid" : "flat"}
                    color="primary"
                    onClick={() => setEventType("group")}
                  >
                    Group Events
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="px-3 min-w-10"
                    variant={timeFilter === "today" ? "solid" : "flat"}
                    color="primary"
                    onClick={() => setTimeFilter("today")}
                  >
                    Today
                  </Button>
                  <Button
                    size="sm"
                    className="px-2 min-w-10"
                    variant={timeFilter === "week" ? "solid" : "flat"}
                    color="primary"
                    onClick={() => setTimeFilter("week")}
                  >
                    This Week
                  </Button>
                </div>
              </div>
              <div className="overflow-y-hidden hover:overflow-y-auto h-full pr-2 border-t scrollbar-hide">
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {Array.isArray(
                    eventType === "your"
                      ? user.events.created
                      : user.events.participating,
                  ) &&
                  filterEvents(
                    eventType === "your"
                      ? user.events.created
                      : user.events.participating,
                    timeFilter,
                  ).length > 0 ? (
                    filterEvents(
                      eventType === "your"
                        ? user.events.created
                        : user.events.participating,
                      timeFilter,
                    ).map((event: SelfieEvent, index: number) => (
                      <EventCard data={event} theme={index} key={index} />
                    ))
                  ) : (
                    <div className="text-success">
                      No events for this period
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-default-100 shadow-lg rounded-2xl p-4 h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-foreground-900">
                    Notes Preview
                  </h3>
                  <Button
                    size="sm"
                    variant="shadow"
                    onClick={() => setShowPublicNotes(!showPublicNotes)}
                    className={` transition-colors ${
                      showPublicNotes ? "bg-emerald-600" : "bg-blue-500"
                    } text-white`}
                  >
                    {showPublicNotes ? "Pubbliche" : "Private"}
                  </Button>
                  <Link
                    href="/notes"
                    as={NextLink}
                    color="primary"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    View All
                  </Link>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-hidden hover:overflow-y-auto scrollbar-hide">
                    {filteredNotes && filteredNotes.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNotes
                          ?.sort(
                            (a: NoteModel, b: NoteModel) =>
                              new Date(b.date!).getTime() -
                              new Date(a.date!).getTime(),
                          )
                          .map((note) => (
                            <NoteCard
                              key={note._id}
                              note={note}
                              onClick={(note) => {
                                router.push(`/notes?id=${note._id}`);
                              }}
                              onDelete={() => {}}
                              showDelete={false}
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-xl text-center font-medium mb-2">
                          Nessuna nota{" "}
                          {showPublicNotes ? "pubblica" : "privata"} disponibile
                        </p>
                        <p className="text-sm">
                          Crea una nuova nota per iniziare
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Of Projects */}
          <div className="flex flex-col justify-center w-full px-4 lg:px-0 max-w-[90rem] gap-2">
            <div className="flex  flex-wrap justify-between">
              <h3 className="text-center text-xl font-semibold">Projects</h3>
              <Link
                href="/projects"
                as={NextLink}
                color="primary"
                className="cursor-pointer"
              >
                View All
              </Link>
            </div>
            <ProjectTable projects={user.projects} />
          </div>
        </div>

        {/* Left Section */}
        <div className="mt-4 gap-2 flex flex-col xl:max-w-md w-full">
          <WeatherCard position={user.position} />

          <div className="grid grid-cols-1 mt-1 max-w-[500px]">
            <PomodoroStatistics stats={user.pomodoro} />
          </div>

          <h3 className="text-xl font-semibold">Friends</h3>
          <div className="flex flex-col justify-center gap-4 flex-wrap md:flex-nowrap md:flex-col">
            <CardFriends
              friends={friends as People}
              setFriends={setFriends}
              currentUserId={user._id}
            />
            <CardChats chats={props.chats} />
          </div>
        </div>
      </div>

      {/* position && (
         <div className="mt-4 p-4 bg-default-100 rounded-lg">
           <h3 className="text-xl font-semibold mb-2">Current Location</h3>
           <p>Latitude: {position.latitude}</p>
           <p>Longitude: {position.longitude}</p>
         </div>
       ) */}

      {/*
      <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
        <div className="flex  flex-wrap justify-between">
          <h3 className="text-center text-xl font-semibold">Latest Users</h3>
          <Link
            href="/accounts"
            as={NextLink}
            color="primary"
            className="cursor-pointer"
          >
            View All
          </Link>
        </div>
        <TableWrapper />
        </div>Table Latest Users */}
    </div>
  );
};
