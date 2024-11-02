import ParticipantContent from "@/components/calendar/participateEvent";
import { getEvent } from '@/actions/events'

const ParticipantPage = async ({
  params,
}: {
  params: Promise<{ eventid: string; participant: string }>;
}) => {
  const event = await getEvent((await params).eventid);
  const participantid = (await params).participant;
  return (
    <ParticipantContent
      event={event}
      participant={participantid}
    />
  );
};

export default ParticipantPage;
