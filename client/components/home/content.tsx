"use client";
import React, { useEffect, useState } from "react";
import { EventCard } from "./event-card";
import { CardFriends } from "./card-friends";
import {
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Tooltip,
} from "@nextui-org/react";
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
import { ReactElement } from "react";
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

export const Content = (props: ContentProps): ReactElement => {
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
      <div className="flex flex-wrap gap-5 justify-center px-4 pt-4 mx-auto w-full 2xl:flex-nowrap xl:px-3 2xl:px-5 max-w-[100rem]">
        <div className="flex flex-col gap-6 mt-6 w-full">
          {/* Card Section Top */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <div className="flex flex-col p-4 rounded-lg border h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      className="capitalize"
                      variant="flat"
                      color="primary"
                    >
                      {eventType === "your" ? "Your" : "Group"} Events
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    selectionMode="single"
                    variant="solid"
                    color="primary"
                    onSelectionChange={(selectedKeys) => {
                      const key = Array.from(selectedKeys)[0];
                      setEventType(key as "your" | "group");
                    }}
                  >
                    <DropdownItem key="your">Your Events</DropdownItem>
                    <DropdownItem key="group">Group Events</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      className="capitalize"
                      variant="flat"
                      color="primary"
                    >
                      {timeFilter === "today"
                        ? "Today"
                        : timeFilter === "week"
                          ? "This Week"
                          : "All"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    selectionMode="single"
                    variant="solid"
                    color="primary"
                    onSelectionChange={(selectedKeys) => {
                      const key = Array.from(selectedKeys)[0];
                      setTimeFilter(key as "today" | "week" | "all");
                    }}
                  >
                    <DropdownItem key="today">Today</DropdownItem>
                    <DropdownItem key="week">This Week</DropdownItem>
                    <DropdownItem key="all">All</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="overflow-y-hidden pr-2 h-full border-t hover:overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 gap-4 pt-4 2xl:grid-cols-2">
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
              <div className="flex flex-col p-4 rounded-2xl shadow-lg bg-default-100 h-[500px]">
                <div className="flex items-center mb-4 md:justify-between">
                    <Link
                      href="/notes"
                      as={NextLink}
                      color="primary"
                      className="cursor-pointer"
                    >
                  <Tooltip content="Go to Notes">
                      <h3 className="text-xl font-semibold text-foreground-900 hover:text-primary">
                        Notes Preview
                      </h3>
                  </Tooltip>
                    </Link>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button size="sm" variant="shadow" className="capitalize">
                        {showPublicNotes ? "Public" : "Private"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      disallowEmptySelection
                      selectionMode="single"
                      variant="solid"
                      color="primary"
                      onSelectionChange={(selectedKeys) => {
                        const key = Array.from(selectedKeys)[0];
                        setShowPublicNotes(key === "public");
                      }}
                    >
                      <DropdownItem key="public">Public</DropdownItem>
                      <DropdownItem key="private">Private</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="overflow-y-hidden h-full hover:overflow-y-auto scrollbar-hide">
                    {filteredNotes && filteredNotes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
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
                      <div className="flex flex-col justify-center items-center h-full text-gray-500">
                        <p className="mb-2 text-xl font-medium text-center">
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
          <div className="flex flex-col gap-2 justify-center px-4 w-full lg:px-0 max-w-[90rem]">
            <div className="flex flex-wrap justify-between">
              <h3 className="text-xl font-semibold text-center">Projects</h3>
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
        <div className="flex flex-col gap-2 mt-6 w-full xl:max-w-md">
          <WeatherCard position={user.position} />

          <div className="flex flex-col gap-2 mt-4 w-full xl:max-w-md">
            <PomodoroStatistics stats={user.pomodoro} />
          </div>

          <h3 className="mb-3 text-xl font-semibold">Friends</h3>
          <div className="flex flex-col flex-wrap gap-4 justify-center md:flex-col md:flex-nowrap max-w-[90rem]">
            <CardFriends
              friends={friends as People}
              setFriends={setFriends}
              currentUserId={user._id}
            />
            <CardChats chats={props.chats} />
          </div>
        </div>
      </div>
    </div>
  );
};
