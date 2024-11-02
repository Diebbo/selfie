import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { getCurrentTime } from "@/actions/setTime";
import { Person, People } from "@/helpers/types";
import { getFriends } from "@/actions/friends";

const Page = async () => {
  try {
    const [dbDate, friends, user]: [Date, People, Person] = await Promise.all([
      getCurrentTime(),
      getFriends(),
      getUser(),
    ]);
    return <CalendarPage
      createdEvents={user.events.created}
      participatingEvents={user.events.participating}
      dbdate={new Date(dbDate)}
      friends={friends}
    />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
