import ParticipantContent from '@/components/calendar/participateEvent';

const ParticipantPage = async ({ params }: { params: { eventid: string, participantid: string } }) => {
  console.log("parametri nella participantPage: ", params);
  return (
    <ParticipantContent
      eventid={params.eventid}
      participantid={params.participantid}
    />
  );
};


export default ParticipantPage;
