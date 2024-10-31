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
  Switch,
  CardBody,
  Skeleton,
  DateRangePicker,
} from "@nextui-org/react";
import {
  SelfieEvent, SelfieNotification,
} from "@/helpers/types";
import NotificationMenu from "@/components/calendar/notificationMenu";
import { useRouter } from 'next/navigation';
import { parseDateTime } from "@internationalized/date";

interface ParticipantContentProps {
  eventid: string;
  participant: string;
}

const initialNotification = {
  title: "",
  description: "",
  type: "",
  repetition: {
    freq: "",
    interval: 0,
  },
  fromDate: new Date(),
};


const ParticipantContent: React.FC<ParticipantContentProps> = ({ eventid, participant }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [event, setEvent] = useState<SelfieEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [owner, setOwner] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([""]);
  const [notificationError, setNotificationError] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [notificationData, setNotificationData] =
    useState<Partial<SelfieNotification>>(initialNotification);
  const [trueParticipant, setTrueParticipant] = useState(false);

  const EVENTS_API_URL = "/api/events";

  const handleReturnToCalendar = () => {
    setIsOpen(false);
    router.refresh();
    router.push("/calendar");
  };


  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } },
  ) => {
    const { name, value } = e.target;

    const [_, notificationField, repetitionField] = name.split(".");

    setNotificationData((prev: any) => {
      if (notificationField === "repetition") {
        return {
          ...prev,
          notification: {
            ...prev.notification,
            repetition: {
              ...prev.notification.repetition,
              [repetitionField]: value,
            },
          },
        };
      }
      if (notificationField === "fromDate") {
        return {
          ...prev,
          notification: {
            ...prev.notification,
            fromDate: new Date(value).toISOString(),
          },
        };
      }
      return {
        ...prev,
        notification: {
          ...prev.notification,
          [notificationField]: value,
        },
      };
    });
  }

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

  useEffect(() => {
    async function fetchParticipantsUsername() {

      try {
        const res = await fetch(`${EVENTS_API_URL}/${eventid}/participants`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store"
        });
        console.log("yt premium");

        if (res.status === 401) {
          throw new Error("Unauthorized, please login.");
        } else if (res.status >= 500) {
          throw new Error(`Server error: ${res.statusText}`);
        } else if (!res.ok) {
          throw new Error("Failed to fetch participants' usernames");
        }

        const participants = await res.json();
        console.log("usernames: ", participants.usernames);
        console.log("uids: ", participants.uids);
        // if you are not a participant you are redirected to calendar page
        if (!participants.uids.includes(participant)) {
          router.refresh()
          router.push("/calendar");
        }
        setTrueParticipant(true);
        setParticipants(participants.usernames);
      } catch (error) {
        console.error("Error fetching participants' usernames:", error);
      }
    }

    fetchParticipantsUsername();
    console.log("partecipants: ", participants);
  }, [event?.participants]);

  useEffect(() => {
    async function fetchOwner() {
      if (!event?.uid) return;

      try {
        console.log("check event owner: ", event.uid);
        const res = await fetch(`/api/users/${event.uid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          throw new Error("Unauthorized, please login.");
        } else if (res.status >= 500) {
          throw new Error(`Server error: ${res.statusText}`);
        } else if (!res.ok) {
          throw new Error("Failed to fetch the event's owner");
        }

        const ownerData = await res.json();
        setOwner(ownerData);
      } catch (error) {
        console.error("Error fetching event's owner: ", error);
      }
    }

    fetchOwner();
  }, [event?.uid]); // Dependency on event.uid

  // TODO: controllare che esista ancora l'evento e lo user 
  const handleResponse = async (response: 'accept' | 'decline') => {
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
          participantId: participant,
          response: response,
        }),
      });

      const link = `/calendar/${eventid}/${participant}`;

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

  const getDateRange = (isAllDay: Boolean) => {
    const today = new Date();

    if (isAllDay) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        start: parseDateTime(today.toISOString().split('T')[0]),
        end: parseDateTime(tomorrow.toISOString().split('T')[0])
      };
    } else {
      const nextHour = new Date(today);
      nextHour.setHours(today.getHours() + 1);
      return {
        start: parseDateTime(today.toISOString().split('T')[0]),
        end: parseDateTime(nextHour.toISOString().split('T')[0])
      };
    }
  };

  //Skeleton di caricamento
  if (loading || !trueParticipant) {
    return (
      <Modal isOpen={true} className="w-[60%] h-[70%] space-y-5 p-4" radius="lg">
        <ModalContent>
          <Skeleton className="w-2/5 rounded-lg">
            <div className="h-4 w-2/5 rounded-lg bg-default-300"></div>
          </Skeleton>
          <ModalHeader>
            <Skeleton className="w-2/5 rounded-lg">
              <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
            </Skeleton>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
              <Skeleton className="w-5/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>

            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
              <Skeleton className="w-5/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>

            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
              <Skeleton className="w-5/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>
          </ModalBody>
          <ModalFooter className="justify-center gap-10">
            <Skeleton className="w-2/5 rounded-lg">
              <Button />
            </Skeleton>
            <Skeleton className="w-2/5 rounded-lg">
              <Button />
            </Skeleton>

          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }
  return (
    <Modal isOpen={isOpen} onClose={handleReturnToCalendar} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold">Sei stato invitato da {owner}</h2>
        </ModalHeader>
        <ModalBody>
          <Card>
            <CardBody>

              <Input
                className="text-gray-600 mb-4"
                label="Titolo evento"
                isReadOnly={true}
                value={event?.title as string}
              />

              <DateRangePicker
                isReadOnly={true}
                className="mb-4"
                label="Data dell'evento"
                visibleMonths={1}
                granularity={event?.allDay ? "day" : "minute"}
                hideTimeZone
                defaultValue={getDateRange(event?.allDay as boolean)}
                classNames={{
                  selectorButton: "hidden",  // nasconde completamente il trigger
                  base: "pointer-events-none" // disabilita le interazioni
                }}
              />

              {event?.location && event?.location.length > 0 && (
                <Input
                  className="text-gray-600 mb-4"
                  isReadOnly={true}
                  value={event.location as string}
                />
              )}

              {event?.description && event?.description.length > 0 && (
                <Input
                  label="Descrizione"
                  className="text-gray-600 mb-4"
                  isReadOnly={true}
                  value={event?.description as string}
                />
              )}

              {event?.participants && event?.participants.length > 0 && (
                <Input
                  label="Partecipanti"
                  className="text-gray-600 mb-4"
                  isReadOnly={true}
                  value={owner + ", ".concat(participants.join(', '))}
                />
              )}

              {event?.URL && event?.URL.length > 0 && (
                <Input
                  label="Link"
                  className="text-gray-600 mb-4"
                  isReadOnly={true}
                  value={event?.URL as string}
                />
              )}

              <Switch
                className="w-fit min-w-[120px] mb-1"
                isSelected={notifications}
                onValueChange={setNotifications}
              >
                Abilita Notifiche
              </Switch>
              <NotificationMenu
                value={notifications}
                notification={notificationData as SelfieNotification}
                onChange={handleInputChange}
                startEventDate={event?.dtstart as Date}
                notificationError={notificationError}
                setNotificationError={setNotificationError}
                isAllDay={event?.allDay as boolean}
              />


            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter className="justify-center gap-10">
          <Button
            color="danger"
            variant="light"
            className="border-1 border-red-700"
            onPress={() => handleResponse('decline')}
          >
            Rifiuta
          </Button>
          <Button
            color="success"
            className="hover:bg-green-600"
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
