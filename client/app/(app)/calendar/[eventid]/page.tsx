//client/app/(app)/calendar/[eventid]/page.tsx   
import ShowEvent from '@/components/calendar/showEvent';
import { getUser } from "@/actions/user";
import { getEvent, getOwner } from '@/actions/events'

const EventPage = async ({ params }: { params: Promise<{ eventid: string }> }) => {
  const event = await getEvent((await params).eventid);
  const user = await getUser();
  const owner = await getOwner(event.uid);

  return (
    <ShowEvent
      event={event}
      user={user}
      owner={owner}
    />
  );
};


export default EventPage;
