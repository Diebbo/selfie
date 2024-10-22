import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getEvents } from "@/actions/events";
import { getCurrentTime } from "@/actions/setTime";
import { People, SelfieEvent } from "@/helpers/types";
import { getFriends } from "@/actions/friends";

const Page = async () => {
  try {
    const [events, dbDate, friends]: [SelfieEvent[], Date, People] = await Promise.all([
      getEvents(),
      getCurrentTime(),
      getFriends(),
    ]);
    return <CalendarPage initialEvents={events} dbdate={new Date(dbDate)} friends={friends} />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
