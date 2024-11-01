import ShowEvent from '@/components/calendar/showEvent';
import { getUser } from "@/actions/user";

const EventPage = async ({ params }: { params: Promise<{ eventid: string }> }) => {
  const { eventid } = await params;
  const user = await getUser();
  return (
    <ShowEvent
      eventid={eventid}
      user={user}
    />
  );
};


export default EventPage;
