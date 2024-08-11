import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import { Community } from "../icons/community";
import { SelfieEvent, People, Person } from "@/helpers/types";

function parseParticipants(participants: People) {
  if (!participants || participants.length === 0) return "No participants";

  var participantsNames = "";
  for (const partcipant of participants) {
    participantsNames += partcipant.name + ", ";
  }
  participantsNames = participantsNames.length < 30 ? participantsNames : participantsNames.substring(0, 30) + "...";
  return participantsNames;
}

interface EventCardTheme {
  bg: string;
  text: string;
}

var themes: EventCardTheme[] = [
  { bg: "bg-primary", text: "text-white" },
  { bg: "bg-default-50", text: "text-black" },
  { bg: "bg-default-100", text: "text-black" },
  { bg: "bg-success", text: "text-white" },
  { bg: "bg-danger", text: "text-white" },
  { bg: "bg-warning", text: "text-danger" },
];

export const EventCard = (props: {data:SelfieEvent, theme:number}) => {
  const data = props.data;
  const theme = themes[props.theme];
  return (
    <Card className={`xl:max-w-sm rounded-xl shadow-md px-3 w-full ${theme.bg}`}>
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white">Participants</span>
            <span className="text-white text-xs">{parseParticipants(data.participants)}</span>
          </div>
        </div>
        <div className="flex gap-2.5 py-2 items-center">
          <span className="text-white text-xl font-semibold">{data.name}</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div>
              <span className={`font-semibold text-xs mr-1 ${theme.text}`}>from</span>
              <span className="text-s text-white">{data.dateFrom.toLocaleDateString()} {data.dateFrom.toLocaleTimeString()}</span>
            </div>
          </div>

          <div>
            <div>
              <span className={`font-semibold text-xs mr-1 ${theme.text}`}>to</span>
              <span className="text-s text-white">{data.dateTo.toLocaleDateString()} {data.dateTo.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
