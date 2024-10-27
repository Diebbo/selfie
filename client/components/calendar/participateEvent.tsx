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
  Chip
} from "@nextui-org/react";
import { Person, SelfieEvent, SelfieNotification } from "@/helpers/types";
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react";

interface ParticipantContentProps {
  eventid: string;
  participantid: string;
}

const ParticipantContent: React.FC<ParticipantContentProps> = ({ eventid, participantid }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [event, setEvent] = useState<SelfieEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Qui dovresti implementare la chiamata API per ottenere i dettagli dell'evento
    // Esempio di mock data:
    const fetchEvent = async () => {
      try {
        // Simula chiamata API
        const response = await fetch(`/api/events/${eventid}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventid]);

  const handleResponse = async (response: 'accept' | 'decline') => {
    try {
      // Implementa la logica per inviare la risposta al server
      await fetch(`/api/events/participate/${eventid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participantid,
          response: response,
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  if (loading || !event) {
    return <div>Caricamento...</div>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="2xl"
    >
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
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <span>
                    {new Date(event.dtstart).toLocaleDateString()} - {new Date(event.dtend).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                  <span>
                    {new Date(event.dtstart).toLocaleTimeString()} - {new Date(event.dtend).toLocaleTimeString()}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-500" />
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
            onPress={() => handleResponse('decline')}
          >
            Rifiuta
          </Button>
          <Button
            color="primary"
            onPress={() => handleResponse('accept')}
          >
            Accetta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ParticipantContent;
