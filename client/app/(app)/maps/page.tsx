"use server";
import Content from "@/components/maps/content";
import "leaflet/dist/leaflet.css";
import { getEvents, MapEvent, getFriends, MapFriend } from "@/actions/maps";

const Page = async () => {
  try {
    const [events, friends] = (await Promise.all([
      getEvents(),
      getFriends(),
    ])) as [MapEvent[], MapFriend[]];

    return <Content events={events} friends={friends} />;
  } catch (error) {
    console.error("Error fetching events:", error);
    return <div>Error loading events. Please try again later.</div>;
  }
};

export default Page;
