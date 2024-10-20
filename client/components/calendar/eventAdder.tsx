"use client";

import React, { useState, useContext } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Switch,
} from "@nextui-org/react";
import RepetitionMenu from "@/components/calendar/repetitionMenu";
import EventDatePicker from "@/components/calendar/eventDatePicker";
import {
  SelfieEvent,
  SelfieNotification,
  FrequencyType,
  Person,
} from "@/helpers/types";
import NotificationMenu from "./notificationMenu";
const EVENTS_API_URL = "/api/events";
import { reloadContext } from "./reloadContext";

async function createEvent(event: SelfieEvent): Promise<boolean> {
  try {
    const res = await fetch(`${EVENTS_API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: event }),
      cache: "no-store", // This ensures fresh data on every request
    });

    if (res.status === 401) {
      throw new Error("Unauthorized, please login.");
    } else if (res.status >= 500) {
      throw new Error(`Server error: ${res.statusText}`);
    } else if (!res.ok) {
      throw new Error("Failed to create events");
    }
  } catch (e) {
    throw new Error(`Error during modify event: ${(e as Error).message}`);
  }
  return true;
}

export default function EventAdder() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<Partial<SelfieEvent>>({
    title: "",
    summary: "",
    status: "confirmed",
    transp: "OPAQUE",
    dtstart: new Date(),
    dtend: new Date(),
    dtstamp: new Date().toISOString(),
    categories: [""],
    location: "",
    description: "",
    URL: "",
    participants: [] as Person[],
    rrule: {
      freq: "weekly",
      interval: 1,
      bymonth: 1,
      bymonthday: 1,
    },
    notification: {
      title: "",
      description: "",
      type: "",
      repetition: {
        freq: "",
        interval: 1,
      },
      fromDate: new Date(),
    },
  });
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isError, setIsError] = useState(false);
  const { reloadEvents, setReloadEvents } = useContext(reloadContext) as any;

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    // can't submit the event if there is no title
    eventData.title !== "" ? setIsOpen(false) : setIsError(true);
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } },
  ) => {
    var { name, value } = e.target;
    if (name.startsWith("title")) setIsError(false);
    if (name.startsWith("notification.")) {
      const notificationField = name.split(".")[1];
      if (name.endsWith("fromDate")) {
        value = new Date(value).toISOString();
      }
      setEventData((prev: any) => ({
        ...prev,
        notification: {
          ...prev.notification,
          [notificationField]: value,
        },
      }));
      console.log("name: ", name, "value: ", value);
    } else {
      setEventData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (start: Date | string, end: Date | string) => {
    setEventData((prev) => ({
      ...prev,
      dtstart: new Date(start),
      dtend: new Date(end),
    }));
  };

  const handleRepeatChange = (value: boolean) => {
    setRepeatEvent(value);
    if (!value) {
      setEventData((prev) => ({ ...prev, rrule: undefined }));
    } else {
      setEventData((prev) => ({
        ...prev,
        rrule: {
          freq: "weekly" as FrequencyType,
          interval: 1,
          bymonth: 1,
          bymonthday: 1,
        },
      }));
    }
  };

  const handleRruleChange = (frequency: FrequencyType) => {
    setEventData((prev) => ({
      ...prev,
      rrule: {
        ...prev.rrule,
        freq: frequency,
        interval: prev.rrule?.interval ?? 1,
        bymonth: prev.rrule?.bymonth ?? 1,
        bymonthday: prev.rrule?.bymonthday ?? 1,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: SelfieEvent = {
      ...eventData,
      sequence: 0,
      categories: eventData.categories || [],
      participants: eventData.participants || [],
    } as SelfieEvent;

    try {
      console.log("newEvent: ", newEvent);
      const success = await createEvent(newEvent);
      if (success) {
        console.log("Event created successfully");
        handleClose();
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error submitting event", error);
    }

    setReloadEvents(true);
  };

  return (
    <>
      <Button
        variant="bordered"
        className="rounded-xl bg-primary text-base text-white border-transparent border-2 hover:border-white"
        onPress={handleOpen}
      >
        Nuovo Evento
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              Creazione Evento
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Titolo"
                isInvalid={isError}
                errorMessage="You need to insert the title before submit the event"
                name="title"
                value={eventData.title as string}
                onChange={handleInputChange}
                placeholder="Inserisci il titolo"
                className="mb-4"
              />
              <div className="flex gap-4 mb-4">
                <EventDatePicker
                  isAllDay={allDayEvent}
                  startDate={eventData.dtstart as Date}
                  endDate={eventData.dtend as Date}
                  onChange={handleDateChange}
                />
                <Switch isSelected={allDayEvent} onValueChange={setAllDayEvent}>
                  Tutto il giorno
                </Switch>
              </div>
              <div className="flex pb-4 gap-4 ">
                <Switch
                  className="w-fit min-w-[120px]"
                  isSelected={repeatEvent}
                  onValueChange={handleRepeatChange}
                >
                  Si ripete
                </Switch>
                <RepetitionMenu
                  value={repeatEvent}
                  frequency={eventData.rrule?.freq}
                  onChange={handleRruleChange}
                />
                <Input
                  className={`${eventData.rrule?.freq ? "w-fit" : "hidden"}`}
                  label="Intervallo fra eventi"
                  value={eventData.rrule?.interval.toString()}
                />
                <Input
                  className={`${eventData.rrule?.freq === "monthly" ? "w-fit" : "hidden"}`}
                  label="Per giorno del mese"
                  value={eventData.rrule?.bymonthday.toString()}
                />
                <Input
                  className={`${eventData.rrule?.freq === "yearly" ? "w-fit" : "hidden"}`}
                  label="Per mese"
                  value={eventData.rrule?.bymonth.toString()}
                />
              </div>
              <Input
                label="Luogo"
                name="location"
                value={eventData.location?.toString()}
                onChange={handleInputChange}
                placeholder="Inserisci il luogo"
                className="mb-4"
              />
              <Textarea
                label="Descrizione"
                name="description"
                value={eventData.description?.toString()}
                onChange={handleInputChange}
                placeholder="Inserisci una descrizione"
                className="mb-4"
              />
              <Input
                label="Partecipanti"
                name="participants"
                value={eventData.participants?.join(", ")}
                /*onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    participants: e.target.value.split(",").map((p) => p.trim()),
                  }))
                }*/
                placeholder="Inserisci i partecipanti (separati da virgola)"
                className="mb-4"
              />
              <Input
                label="Categorie"
                name="categories"
                value={eventData.categories?.join(", ")}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    categories: e.target.value.split(",").map((c) => c.trim()),
                  }))
                }
                placeholder="Inserisci le categorie (separate da virgola)"
                className="mb-4"
              />
              <Input
                label="URL"
                name="URL"
                value={eventData.URL?.toString()}
                onChange={handleInputChange}
                placeholder="Inserisci l'URL dell'evento"
                className="mb-4"
              />
              <div className="flex flex-col pb-4 gap-4 ">
                <Switch
                  className="w-fit min-w-[120px]"
                  isSelected={notifications}
                  onValueChange={setNotifications}
                >
                  Abilita le notifiche
                </Switch>
                <NotificationMenu
                  value={notifications}
                  notification={eventData.notification as SelfieNotification}
                  onChange={handleInputChange}
                  eventDate={eventData.dtstart as Date}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit" onClick={handleClose}>
                Salva
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
