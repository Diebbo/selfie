import type { NextPage } from "next";
import { Content } from "@/components/home/content";
import { getEvents } from "@/actions/events";

const Home: NextPage = async () => {
  try {
    // Fetch events from the backend
    const events = await getEvents();

    // Pass the fetched events to the Content component
    return <Content events={events} />;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    // You might want to render an error state here
    return <div>Error loading events. Please try again later.</div>;
  }
};

export default Home;
