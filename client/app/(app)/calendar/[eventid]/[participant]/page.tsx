import ParticipantContent from "@/components/calendar/participateEvent";

const ParticipantPage = async ({ params }: { params: { eventid: string, participant: string } }) => {
  console.log("parametri nella participantPage: ", params);
  return (
    <ParticipantContent
      eventid={params.eventid}
      participant={params.participant}
    />
  );
};

export default ParticipantPage;
