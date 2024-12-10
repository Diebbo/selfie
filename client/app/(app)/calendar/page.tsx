import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { getCurrentTime } from "@/actions/setTime";
import { Person, People, ProjectModel, ResourceModel } from "@/helpers/types";
import { getFriends } from "@/actions/friends";
import { getTasks } from "@/actions/tasks";
import getProjects from "@/actions/projects"
import { TaskMutiResponse } from "@/helpers/api-types";
import { showError } from "@/helpers/error-checker";
import { getResource } from "@/actions/events";

const Page = async () => {
  try {
    const [dbDate, friends, user, projects, tasks, resource]: [Date, People, Person | Error, ProjectModel[], TaskMutiResponse, ResourceModel[]] = await Promise.all([
      getCurrentTime(),
      getFriends(),
      getUser(),
      getProjects(),
      getTasks(),
      getResource()
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
      resource={resource}
    />;
  } catch (error) {
    return showError(error);
  }
};

export default Page;
