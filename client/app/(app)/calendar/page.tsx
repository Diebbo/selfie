import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getEvents } from "@/actions/events";
import { getCurrentTime } from "@/actions/setTime";
import { SelfieEvent } from "@/helpers/types";

const Page = async () => {
  try {
    const [events, dbDate]: [SelfieEvent[], Date] = await Promise.all([
      getEvents(),
      getCurrentTime(),
    ]);
    return <CalendarPage initialEvents={events} dbdate={new Date(dbDate)} />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
