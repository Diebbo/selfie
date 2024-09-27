// page.tsx (Server-Side Component)

import { getEvents } from "@/actions/events";
import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";

export default async function Home() {
  try {
    // Fetch events and chats data
    const events = await getEvents();
    const chats = await getChats();

    // Pass the fetched data to the client-side component
    return <Content events={events} chats={chats} />;

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return <div>Unexpected error occurred. Please try again later.</div>;

  }
}
