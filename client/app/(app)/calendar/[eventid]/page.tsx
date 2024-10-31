import ShowEvent from '@/components/calendar/showEvent';
import { getUser } from "@/actions/user";

const EventPage = async ({ params }: { params: { eventid: string } }) => {
  const { eventid } = params;
  console.log(eventid);
  const user = await getUser();
  return (
    <ShowEvent
      eventid={eventid}
      user={user}
      friends={user.friends}
    />
  );
};


export default EventPage;
