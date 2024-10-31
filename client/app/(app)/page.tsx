// page.tsx (Server-Side Component)

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";

import {
  ChatModel,
  NoteModel,
  Person,
  PomodoroStats,
  ProjectModel,
  SelfieEvent,
} from "@/helpers/types";
import { getNotes } from "@/actions/notes";
import { getStats } from "@/actions/pomodoro";
import getProjects from "@/actions/projects";
import { getEvents } from "@/actions/events";


export default async function Home() {
  try {
    const [chats, notes, pomodoro, projects, events, user]: [
      ChatModel[],
      NoteModel[],
      PomodoroStats,
      ProjectModel[],
      SelfieEvent[], 
      Person
    ] = await Promise.all([
      getChats(),
      getNotes(),
      getStats(),
      getProjects(),
      getEvents(),
      getUser(),
    ]);

    // Pass the fetched data to the client-side component
    return (
      <>
        <Content
          chats={chats}
          notes={user.notes}
          projects={user.projects}
          pomodoro={user.pomodoro}
          events={user.events}
          user = {user}
        />
      </>
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return <div>Unexpected error occurred. Please try again later.</div>;
  }
}
