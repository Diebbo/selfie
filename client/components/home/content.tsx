"use client";
import React from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../table/table";
import { EventCard } from "./event-card";
import { CardAgents } from "./card-agents";
import { CardTransactions } from "./card-transactions";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import { SelfieEvent } from "@/helpers/types";
import { CardChats } from "./card-chats";
import { People } from "@/helpers/types";

const Chart = dynamic(
  () => import("../charts/steam").then((mod) => mod.Steam),
  {
    ssr: false,
  }
);

interface ContentProps {
  events: {
    createdEvents: any[];
    participatingEvents: any[];
  };
  chats: any[];
  friends: People;
}

export const Content = (props: ContentProps) => {
  const [friends, setFriends] = React.useState<People>(props.friends);
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          {/* Card Section Top */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Next Events</h3>
            <h4 className="text-l font-semibold">Your Events</h4>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
              {
                Array.isArray(props.events.createdEvents) && props.events.createdEvents.length > 0 ? (
                  props.events.createdEvents.slice(0, 5).map((event: SelfieEvent, index: number) => (
                    <EventCard data={event} theme={index} key={index} />
                  ))
                ) : (
                  <div className="text-success">No future events</div> // Your alternative content here
                )
              }
            </div>
            <h4 className="text-l font-semibold">Participating Events</h4>
            <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
              {
                Array.isArray(props.events.participatingEvents) && props.events.participatingEvents.length > 0 ? (
                  props.events.participatingEvents.slice(0, 5).map((event: SelfieEvent, index: number) => (
                    <EventCard data={event} theme={index} key={index} />
                  ))
                ) : (
                  <div className="text-success">Niente attivita&apos; sociali</div> // Your alternative content here
                )
              }
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
            <CardAgents friends={friends} setFriends={setFriends}/>
            <CardChats chats={props.chats} />
          </div>
        </div>
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
}
