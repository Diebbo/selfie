//client/app/(app)/calendar/[eventid]/page.tsx   
import ShowEvent from '@/components/calendar/showEvent';
import { getUser } from "@/actions/user";
import { getEvent, getOwner, getResource } from '@/actions/events'
import { getFriends } from "@/actions/friends";
import { showError } from '@/helpers/error-checker';

const EventPage = async ({ params }: { params: Promise<{ eventid: string }> }) => {
  const [event, user, owner, resource, friends] = await Promise.all([
    getEvent((await params).eventid),
    getUser(),
    getOwner(String((await getEvent((await params).eventid)).uid)),
    getResource(),
    getFriends(),
  ]);

  if (user instanceof Error) {
    return showError(user);
  }

  return (
    <ShowEvent
      event={event}
      user={user}
      owner={owner}
      friends={friends}
      resource={resource}
    />
  );
};


export default EventPage;
