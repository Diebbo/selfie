import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { getCurrentTime } from "@/actions/setTime";
import { Person, People, ProjectModel, TaskModel } from "@/helpers/types";
import { getFriends } from "@/actions/friends";
import { getTasks } from "@/actions/tasks";
import getProjects from "@/actions/projects"
import { TaskMutiResponse } from "@/helpers/api-types";
import { showError } from "@/helpers/error-checker";

const Page = async () => {
  try {
    const [dbDate, friends, user, projects, tasks]: [Date, People, Person | Error, ProjectModel[], TaskMutiResponse] = await Promise.all([
      getCurrentTime(),
      getFriends(),
      getUser(),
      getProjects(),
      getTasks(),
    ]);

    if (user instanceof Error) {
      return showError(user);
    }

    return <CalendarPage
      createdEvents={user.events.created}
      participatingEvents={user.events.participating}
      dbdate={new Date(dbDate)}
      friends={friends}
      tasks={tasks}
      projects={projects}
    />;
  } catch (error) {
    return showError(error);
  }
};

export default Page;
