"use server";
import Content from "@/components/maps/content";
import "leaflet/dist/leaflet.css";
import { getEvents, MapEvent } from "@/actions/maps";

const Page = async () => {
  try {
    const events: MapEvent[] = await getEvents();
    return <Content events={events} />;
  } catch (error) {
    console.error("Error fetching events:", error);
    return <div>Error loading events. Please try again later.</div>;
  }
};

export default Page;
