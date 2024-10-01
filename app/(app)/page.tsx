// page.tsx (Server-Side Component)

import { getEvents } from "@/actions/events";
import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getFriends } from "@/actions/friends";

export default async function Home() {
  try {
    const [events, chats, friends] = await Promise.all([
      getEvents(),
      getChats(),
      getFriends()
    ]);
    
    // Pass the fetched data to the client-side component
    return <Content events={events} chats={chats} friends={friends} />;

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return <div>Unexpected error occurred. Please try again later.</div>;

  }
}
