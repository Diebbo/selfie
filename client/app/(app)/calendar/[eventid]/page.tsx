import ShowEvent from '@/components/calendar/showEvent';
import { getUser } from "@/actions/user";
import { getEvent } from '@/actions/events'

const EventPage = async ({ params }: { params: Promise<{ eventid: string }> }) => {
  const event = await getEvent((await params).eventid);
  const user = await getUser();
  return (
    <ShowEvent
      event={event}
      user={user}
    />
  );
};


export default EventPage;
