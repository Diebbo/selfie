// page.tsx (Server-Side Component)

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";
import { ChatModel, NoteModel, Person, PomodoroStats } from "@/helpers/types";
import { getNotes } from "@/actions/notes";
import { getStats } from "@/actions/pomodoro";

export default async function Home() {
  try {
    const [user, chats, notes, pomodoro]: [
      Person,
      ChatModel[],
      NoteModel[],
      PomodoroStats,
    ] = await Promise.all([getUser(), getChats(), getNotes(), getStats()]);

    // Pass the fetched data to the client-side component
    return (
      <>
        <Content
          events={user.events}
          chats={chats}
          friends={user.friends}
          notes={notes}
          pomodoro={pomodoro}
        />
      </>
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return <div>Unexpected error occurred. Please try again later.</div>;
  }
}
