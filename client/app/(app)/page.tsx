// page.tsx (Server-Side Component)

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";

import { ChatModel, NoteModel, Person, PomodoroStats, ProjectModel } from "@/helpers/types";
import { getNotes } from "@/actions/notes";
import { getStats } from "@/actions/pomodoro";
import getProjects from "@/actions/projects";

export default async function Home() {
  try {
    const [user, chats, notes, pomodoro]: [
      Person,
      ChatModel[],
      NoteModel[],
      PomodoroStats,
      ProjectModel[]
    ] = await Promise.all([getUser(), getChats(), getNotes(), getStats(), getProjects()]);


    console.log("User p:", projects);

    // Pass the fetched data to the client-side component
    return (
      <>
        <Content
          events={user.events}
          chats={chats}
          friends={user.friends}
          notes={notes}
          user={user} 
          projects={projects}
          pomodoro={pomodoro}
        />
      </>
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return <div>Unexpected error occurred. Please try again later.</div>;
  }
}
