// page.tsx (Server-Side Component)

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";
import { ChatModel, Person } from "@/helpers/types";

export default async function Home() {
  try {
    const [user, chats]: [Person, ChatModel[]] = await Promise.all([
      getUser(),
      getChats(),
    ]);

    // Pass the fetched data to the client-side component
    return (
      <>
        <Content events={user.events} chats={chats} friends={user.friends} _id={user._id} />
      </>
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return <div>Unexpected error occurred. Please try again later.</div>;
  }
}
