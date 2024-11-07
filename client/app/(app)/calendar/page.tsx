import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { getCurrentTime } from "@/actions/setTime";
import { Person, People, ProjectModel, TaskModel } from "@/helpers/types";
import { getFriends } from "@/actions/friends";
import { getTasks } from "@/actions/tasks";
import getProjects from "@/actions/projects"
import { TaskMutiResponse } from "@/helpers/api-types";

const Page = async () => {
  try {
    const [dbDate, friends, user, projects, tasks]: [Date, People, Person, ProjectModel[], TaskMutiResponse] = await Promise.all([
      getCurrentTime(),
      getFriends(),
      getUser(),
      getProjects(),
      getTasks(),
    ]);
    return <CalendarPage
      createdEvents={user.events.created}
      participatingEvents={user.events.participating}
      dbdate={new Date(dbDate)}
      friends={friends}
      tasks={tasks}
      projects={projects}
    />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
