import ParticipantContent from "@/components/calendar/participateEvent";
import { getEvent, getOwner } from '@/actions/events'

const ParticipantPage = async ({
  params,
}: {
  params: Promise<{ eventid: string; participant: string }>;
}) => {
  const event = await getEvent((await params).eventid);
  const participantid = (await params).participant;
  const owner = await getOwner(event.uid);
  return (
    <ParticipantContent
      event={event}
      participant={participantid}
      owner={owner}
    />
  );
};

export default ParticipantPage;
