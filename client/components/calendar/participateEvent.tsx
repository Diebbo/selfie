"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  Input,
  CardBody,
  Skeleton,
  DateRangePicker,
} from "@nextui-org/react";
import { SelfieEvent, Person } from "@/helpers/types";
import { useRouter } from "next/navigation";
import { parseDateTime } from "@internationalized/date";

interface ParticipantContentProps {
  event: SelfieEvent;
  participant: string;
  owner: string;
}

const ParticipantContent: React.FC<ParticipantContentProps> = ({
  owner,
  event,
  participant,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [participants, setParticipants] = useState<Partial<Person>[]>([]);
  const [trueParticipant, setTrueParticipant] = useState(false);
  const eventid = event?._id;
  const [error, setError] = useState<string | null>(null);

  const EVENTS_API_URL = "/api/events";

  const handleReturnToCalendar = () => {
    setIsOpen(false);
    router.refresh();
    router.push("/calendar");
  };

  //da rivedere e mettere serverside, dopo il merge con develop
  useEffect(() => {
    async function fetchParticipantsUsername() {
      const res = await fetch(`${EVENTS_API_URL}/${eventid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return new Error("Failed to fetch participants' usernames");
      }

      const event = await res.json();

      const participants = event.participants;

      // if you are not a participant you are redirected to calendar page
      if (!participants.map((p: any) => p?._id).includes(participant)) {
        router.refresh();
        router.push("/calendar");
      }

      setTrueParticipant(true);
      setParticipants(participants.map((p: any) => p.username));
    }

    const ret = fetchParticipantsUsername();
    if (ret instanceof Error) {
      setError(ret.message);
    }

  }, [event.participants]);

  const handleResponse = async (response: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/events/participate/${eventid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId: participant,
          response: response,
        }),
      });

      const link = `/calendar/${eventid}/${participant}`;

      await fetch(`/api/users/inbox/link`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: link,
        }),
      });

      handleReturnToCalendar();
    } catch (error) {
      console.error("Error sending response:", error);
    }
  };

  const getDateRange = (isAllDay: Boolean) => {
    const today = new Date();

    if (isAllDay) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        start: parseDateTime(today.toISOString().split("T")[0]),
        end: parseDateTime(tomorrow.toISOString().split("T")[0]),
      };
    } else {
      const nextHour = new Date(today);
      nextHour.setHours(today.getHours() + 1);
      return {
        start: parseDateTime(today.toISOString().split("T")[0]),
        end: parseDateTime(nextHour.toISOString().split("T")[0]),
      };
    }
  };

  if (error) {
    return (
      <Modal isOpen={true} onClose={handleReturnToCalendar}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">Errore</h2>
          </ModalHeader>
          <ModalBody>
            <p>{error}</p>
          </ModalBody>
          <ModalFooter className="gap-10 justify-center">
            <Button onPress={handleReturnToCalendar}>
              Go back to calendar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  //Skeleton di caricamento
  if (!trueParticipant) {
    return (
      <Modal
        isOpen={true}
        className="w-[60%] h-[70%] space-y-5 p-4"
        radius="lg"
      >
        <ModalContent>
          <Skeleton className="w-2/5 rounded-lg">
            <div className="w-2/5 h-4 rounded-lg bg-default-300"></div>
          </Skeleton>
          <ModalHeader>
            <Skeleton className="w-2/5 rounded-lg">
              <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
            </Skeleton>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="w-3/5 h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="w-4/5 h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
              <Skeleton className="rounded-lg w-5/5">
                <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>

            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="w-3/5 h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="w-4/5 h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
              <Skeleton className="rounded-lg w-5/5">
                <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>

            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="w-3/5 h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="w-4/5 h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
              <Skeleton className="rounded-lg w-5/5">
                <div className="w-2/5 h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>
          </ModalBody>
          <ModalFooter className="gap-10 justify-center">
            <Skeleton className="w-2/5 rounded-lg">
              <Button />
            </Skeleton>
            <Skeleton className="w-2/5 rounded-lg">
              <Button />
            </Skeleton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
  return (
    <Modal isOpen={isOpen} onClose={handleReturnToCalendar} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold">
            You have been invated from {owner}
          </h2>
        </ModalHeader>
        <ModalBody>
          <Card>
            <CardBody>
              <Input
                className="mb-4 text-gray-600"
                label="Event title"
                isReadOnly={true}
                value={event?.title as string}
              />

              <DateRangePicker
                isReadOnly={true}
                className="mb-4"
                label="Event date"
                visibleMonths={1}
                granularity={event?.allDay ? "day" : "minute"}
                hideTimeZone
                defaultValue={getDateRange(event?.allDay as boolean)}
                classNames={{
                  selectorButton: "hidden", // nasconde completamente il trigger
                  base: "pointer-events-none", // disabilita le interazioni
                }}
              />

              {event?.location && event?.location.length > 0 && (
                <Input
                  className="mb-4 text-gray-600"
                  isReadOnly={true}
                  value={event.location as string}
                />
              )}

              {event?.description && event?.description.length > 0 && (
                <Input
                  label="Description"
                  className="mb-4 text-gray-600"
                  isReadOnly={true}
                  value={event?.description as string}
                />
              )}

              {event?.participants && event?.participants.length > 0 && (
                <Input
                  label="Participants"
                  className="mb-4 text-gray-600"
                  isReadOnly={true}
                  value={
                    owner +
                    ", ".concat(participants.map((p: any) => p?.username).join(", "))
                  }
                />
              )}

              {event?.URL && event?.URL.length > 0 && (
                <Input
                  label="Link"
                  className="mb-4 text-gray-600"
                  isReadOnly={true}
                  value={event?.URL as string}
                />
              )}
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter className="gap-10 justify-center">
          <Button
            color="danger"
            variant="light"
            className="border-red-700 border-1"
            onPress={() => handleResponse("decline")}
          >
            Reject
          </Button>
          <Button
            color="success"
            className="hover:bg-green-600"
            onPress={() => handleResponse("accept")}
          >
            Accept
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ParticipantContent;
