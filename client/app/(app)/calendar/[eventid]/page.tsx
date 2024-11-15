//client/app/(app)/calendar/[eventid]/page.tsx   
import ShowEvent from '@/components/calendar/showEvent';
import { getUser } from "@/actions/user";
import { getEvent, getOwner } from '@/actions/events'
import { showError } from '@/helpers/error-checker';

const EventPage = async ({ params }: { params: Promise<{ eventid: string }> }) => {
  const [event, user, owner] = await Promise.all([
    getEvent((await params).eventid),
    getUser(),
    getOwner(String((await getEvent((await params).eventid)).uid))
  ]);

  if (user instanceof Error) {
    return showError(user);
  }
      

  return (
    <ShowEvent
      event={event}
      user={user}
      owner={owner}
    />
  );
};


export default EventPage;
