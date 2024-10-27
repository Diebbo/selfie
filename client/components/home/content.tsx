"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../table/table";
import { EventCard } from "./event-card";
import { CardFriends } from "./card-friends";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import { Person, ProjectModel, SelfieEvent } from "@/helpers/types";
import { CardChats } from "./card-chats";
import { People } from "@/helpers/types";
import { useGeolocation } from "@/helpers/useGeolocation";
import { ProjectTable } from "./project-table";

const Chart = dynamic(
  () => import("../charts/steam").then((mod) => mod.Steam),
  {
    ssr: false,
  },
);

interface ContentProps {
  events: {
    created: SelfieEvent[];
    participating: SelfieEvent[];
  };
  chats: any[];
  friends: People;
  projects: ProjectModel[];
  user: Person;
}

export const Content = (props: ContentProps) => {
  const [friends, setFriends] = useState<People>(props.friends);
  const { position, error } = useGeolocation();

  useEffect(() => {
    if (position) {
      sendPositionToServer(position);
    }
  }, [position]);

  const sendPositionToServer = async (position: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      console.log("Sending position to server:", position);
      const response = await fetch("/api/users/gps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(position),
      });

      if (!response.ok) {
        throw new Error("Failed to update position");
      }

      console.log("Position updated successfully");
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  if (error) {
    console.error("Geolocation error:", error);
  }

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Card Section Top */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Next Events</h3>
            <h4 className="text-l font-semibold">Your Events</h4>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
              {Array.isArray(props.events.created) &&
                props.events.created.length > 0 ? (
                props.events.created
                  .slice(0, 5)
                  .map((event: SelfieEvent, index: number) => (
                    <EventCard data={event} theme={index} key={index} />
                  ))
              ) : (
                <div className="text-success">No future events</div> // Your alternative content here
              )}
              {/*<EventCard data={dummy.dummyEvents[0]} theme={5}/>
            <EventCard data={dummy.dummyEvents[1]} theme={1}/>
            <EventCard data={dummy.dummyEvents[2]} theme={0}/>*/}
              {/*<CardBalance1 />
            <CardBalance2 />
            <CardBalance3 /> */}
            </div>
            <h4 className="text-l font-semibold">Participating Events</h4>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
              {Array.isArray(props.events.participating) &&
                props.events.participating.length > 0 ? (
                props.events.participating
                  .slice(0, 5)
                  .map((event: SelfieEvent, index: number) => (
                    <EventCard data={event} theme={index} key={index} />
                  ))
              ) : (
                <div className="text-success">
                  Niente attivita&apos; sociali
                </div> // Your alternative content here
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Calendar</h3>
            <div className="w-full bg-default-50 shadow-lg rounded-2xl p-6 ">
              {/* <Chart /> */}
              TODO
            </div>
          </div>
        </div>

        {/* Left Section */}
        <div className="mt-4 gap-2 flex flex-col xl:max-w-md w-full">
          <h3 className="text-xl font-semibold">Friends</h3>
          <div className="flex flex-col justify-center gap-4 flex-wrap md:flex-nowrap md:flex-col">
            <CardFriends friends={friends} setFriends={setFriends} currentUserId={props.user._id} />
            <CardChats chats={props.chats} />
          </div>
        </div>
      </div>

      {position && (
        <div className="mt-4 p-4 bg-default-100 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Current Location</h3>
          <p>Latitude: {position.latitude}</p>
          <p>Longitude: {position.longitude}</p>
        </div>
      )}


      {/* Table Of Projects */}
      <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
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
        <ProjectTable projects={props.projects} creator={props.user} />
      </div>

      {/* Table Latest Users */}
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
      </div>
    </div>
  );
};
