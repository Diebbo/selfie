import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import { Community } from "../icons/community";
import { SelfieEvent } from "@/helpers/types";

interface EventCardTheme {
  bg: string;
  text: string;
}

var themes: EventCardTheme[] = [
  { bg: "bg-primary", text: "text-warning" },
  //{ bg: "bg-default-50", text: "text-black" },
  //{ bg: "bg-default-100", text: "text-black" },
  { bg: "bg-success", text: "text-white" },
  { bg: "bg-danger", text: "text-white" },
  { bg: "bg-warning", text: "text-danger" },
];

export const EventCard = (props: { data: SelfieEvent; theme: number }) => {
  function formatDate(dateString: Date) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }

    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }
  const data = props.data;
  const theme = themes[props.theme % themes.length];
  return (
    <Card
      className={`xl:max-w-sm rounded-xl shadow-md px-2 w-full ${theme.bg}`}
    >
      <CardBody className="py-4 overflow-hidden">
        <div className="flex gap-2">
          <Community />
          <div className="flex flex-col">
            <span className="text-white">Participants</span>
            <span className="text-white text-xs">
              {data.participants}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 py-2 items-center ">
          <span className="text-white text-lg font-medium">{data.title}</span>
        </div>

        <div>
          <span className={`font-semibold text-xs mr-1 ${theme.text}`}>
            from
          </span>
          <span className="text-s text-white">{formatDate(data.dtstart)}</span>
        </div>

        <div>
          <span className={`font-semibold text-xs mr-1 ${theme.text}`}>to</span>
          <span className="text-s text-white">{formatDate(data.dtend)}</span>
        </div>
      </CardBody>
    </Card>
  );
};
