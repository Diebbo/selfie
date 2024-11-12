"use server";

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";

import {
  ChatModel,
  Person,
} from "@/helpers/types";

export default async function Home() {
  try {
    const [chats,  user]: [
      ChatModel[],
      Person | Error
    ] = await Promise.all([
      getChats(),
      getUser(),
    ]);

    if (user instanceof Error) {
      throw user.message;
    }

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
    console.log(error);
    return <div className="text-danger">{error}</div>;
  }
}
