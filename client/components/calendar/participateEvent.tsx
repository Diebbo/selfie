"use client";

import React from "react";
import { Person, SelfieEvent, SelfieNotification } from "@/helpers/types";

interface ParticipantContentProps {
  eventid: string;
  participantid: string;
}

const ParticipantContent: React.FC<ParticipantContentProps> = ({ eventid, participantid }) => {

  return (
    <span> test </span>
  );
};


export default ParticipantContent;
