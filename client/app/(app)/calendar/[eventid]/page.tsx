import ShowEvent from '@/components/calendar/showEvent';

const EventPage = async ({ params }: { params: { eventid: string } }) => {
  const { eventid } = params;
  console.log(eventid);
  return (
    <ShowEvent
      eventid={eventid}
    />
  );
};


export default EventPage;
