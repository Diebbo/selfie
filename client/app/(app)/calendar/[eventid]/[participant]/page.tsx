import ParticipantContent from "@/components/calendar/participateEvent";
import { getEvent, getOwner } from '@/actions/events'

const ParticipantPage = async ({
  params,
}: {
  params: Promise<{ eventid: string; participant: string }>;
}) => {
  const event = await getEvent((await params).eventid);
  const participantid = (await params).participant;
  console.log("owner id ", event.uid);
  const owner = await getOwner(event.uid);
  console.log("owner", owner);
  return (
    <ParticipantContent
      event={event}
      participant={participantid}
      owner={owner}
    />
  );
};

export default ParticipantPage;
