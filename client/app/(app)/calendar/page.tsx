import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { getCurrentTime } from "@/actions/setTime";
import { Person, People, ProjectModel, ResourceModel } from "@/helpers/types";
import { getFriends } from "@/actions/friends";
import getProjects from "@/actions/projects"
import { getResource } from "@/actions/events";

const Page = async () => {
  try {
    const [dbDate, friends, user, projects, resource]: [Date, People, Person, ProjectModel[], ResourceModel[]] = await Promise.all([
      getCurrentTime(),
      getFriends(),
      getUser(),
      getProjects(),
      getResource()
    ]);
    return <CalendarPage
      createdEvents={user.events.created}
      participatingEvents={user.events.participating}
      dbdate={new Date(dbDate)}
      friends={friends}
      projects={projects}
      resource={resource}
    />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
