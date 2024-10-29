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
  CardBody,
  Chip,
} from "@nextui-org/react";
import { Person, SelfieEvent, SelfieNotification } from "@/helpers/types";
import { useRouter } from "next/navigation";
import getBaseUrl from "@/config/proxy";

interface ParticipantContentProps {
  eventid: string;
  participantid: string;
}

const ParticipantContent: React.FC<ParticipantContentProps> = ({
  eventid,
  participantid,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [event, setEvent] = useState<SelfieEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const EVENTS_API_URL = "/api/events";

  const handleReturnToCalendar = () => {
    setIsOpen(false);
    router.refresh();
    router.push("/calendar");
  };

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${EVENTS_API_URL}/${eventid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          throw new Error("Unauthorized, please login.");
        } else if (res.status >= 500) {
          throw new Error(`Server error: ${res.statusText}`);
        } else if (!res.ok) {
          throw new Error("Failed to fetch the event");
        }

        setEvent(await res.json());
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventid]);

  const handleResponse = async (response: "accept" | "decline") => {
    console.log("dentro handle response");
    try {
      console.log("faccio la post");
      // Implementa la logica per inviare la risposta al server
      const res = await fetch(`/api/events/participate/${eventid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId: participantid,
          response: response,
        }),
      });

      const link = `/calendar/${eventid}/${participantid}`;

      const del = await fetch(`/api/users/inbox/link`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: link,
        }),
      });

      console.log(await res.json());

      handleReturnToCalendar();
    } catch (error) {
      console.error("Error sending response:", error);
    }
  };

  if (loading || !event) {
    return <div>Caricamento...</div>;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleReturnToCalendar} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">{event.title}</h3>
        </ModalHeader>
        <ModalBody>
          <Card>
            <CardBody>
              <div className="space-y-4">
                {event.description && (
                  <p className="text-gray-600">{event.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <span>
                    {new Date(event.dtstart).toLocaleDateString()} -{" "}
                    {new Date(event.dtend).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span>
                    {new Date(event.dtstart).toLocaleTimeString()} -{" "}
                    {new Date(event.dtend).toLocaleTimeString()}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <span>{event.location}</span>
                  </div>
                )}

                {event.categories && event.categories.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {event.categories.map((category, index) => (
                      <Chip key={index} color="primary" variant="flat">
                        {category}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => handleResponse("decline")}
          >
            Rifiuta
          </Button>
          <Button color="primary" onPress={() => handleResponse("accept")}>
            Accetta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ParticipantContent;
