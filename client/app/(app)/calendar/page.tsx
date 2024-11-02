import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { getCurrentTime } from "@/actions/setTime";
import { Person, People, ProjectModel } from "@/helpers/types";
import { getFriends } from "@/actions/friends";
import getProjects from "@/actions/projects"

const Page = async () => {
  try {
    const [dbDate, friends, user, projects]: [Date, People, Person, ProjectModel[]] = await Promise.all([
      getCurrentTime(),
      getFriends(),
      getUser(),
      getProjects(),
    ]);
    return <CalendarPage
      createdEvents={user.events.created}
      participatingEvents={user.events.participating}
      dbdate={new Date(dbDate)}
      friends={friends}
      projects={projects}
    />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
