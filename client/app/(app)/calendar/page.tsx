import React from "react";
import CalendarPage from "@/components/calendar/calendar";
import { getUser } from "@/actions/user";
import { Person, People, ProjectModel } from "@/helpers/types";
import { getFriends } from "@/actions/friends";
import getProjects from "@/actions/projects";

const Page = async () => {
  try {
    const [friends, user, projects]: [People, Person, ProjectModel[]] =
      await Promise.all([getFriends(), getUser(), getProjects()]);
    return (
      <CalendarPage
        createdEvents={user.events.created}
        participatingEvents={user.events.participating}
        friends={friends}
        projects={projects}
      />
    );
  } catch (error) {
    console.log(error);
  }
};

export default Page;
