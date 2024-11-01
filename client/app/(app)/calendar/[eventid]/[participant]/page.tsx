import ParticipantContent from "@/components/calendar/participateEvent";

const ParticipantPage = async ({
  params,
}: {
  params: Promise<{ eventid: string; participant: string }>;
}) => {
  const eventid = (await params).eventid;
  const participantid = (await params).participant;
  return (
    <ParticipantContent
      eventid={eventid}
      participantid={participantid}
    />
  );
};

export default ParticipantPage;
