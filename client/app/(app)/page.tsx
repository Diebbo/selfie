"use server";

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";

import {
  ChatModel,
  Person,
} from "@/helpers/types";

import { getNotes } from "@/actions/notes";
import { getStats } from "@/actions/pomodoro";
import getProjects from "@/actions/projects";
import { getEvents } from "@/actions/events";

export default async function Home() {
  try {
    const [chats, notes, user]: [ChatModel[], NoteModel[], Person] =
      await Promise.all([getChats(), getNotes(), getUser()]);

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
