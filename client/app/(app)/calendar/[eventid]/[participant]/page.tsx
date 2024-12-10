import ParticipantContent from "@/components/calendar/participateEvent";
import { getEventv2, getOwner } from '@/actions/events'

const ParticipantPage = async ({
  params,
}: {
  params: Promise<{ eventid: string; participant: string }>;
}) => {
  const event = await getEventv2((await params).eventid);
  const participantid = (await params).participant;

  if (event instanceof Error) {
    return <div>{event.message}</div>;
  }

  const owner = await getOwner(String(event.uid));

  return (
    <ParticipantContent
      event={event}
      participant={participantid}
      owner={owner}
    />
  );
};

export default ParticipantPage;
