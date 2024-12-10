"use server";

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";

import { ChatModel, NoteModel, Person } from "@/helpers/types";
import { getNotes } from "@/actions/notes";

export default async function Home() {
  try {
    const [chats, user, notes]: [ChatModel[], Person | Error, NoteModel[]] =
      await Promise.all([getChats(), getUser(), getNotes()]);

    console.log(notes);
    if (user instanceof Error) {
      throw user.message;
    }

    // Pass the fetched data to the client-side component
    return (
      <>
        <Content
          chats={chats}
          notes={notes}
          projects={user.projects}
          pomodoro={user.pomodoro}
          events={user.events}
          user={user}
        />
      </>
    );
  } catch (error: any) {
    console.log(error);
    return <div className="text-danger">{error}</div>;
  }
}
