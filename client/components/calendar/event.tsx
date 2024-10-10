"use client";

import React, { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Switch,
  DatePicker,
  DateRangePicker,
} from "@nextui-org/react";
import RepetitionMenu from "@/components/calendar/repetitionMenu";
import EventDatePicker from "@/components/calendar/eventDatePicker";
import SelfieEvent from "@/helpers/types.ts";
import {parseZonedDateTime} from "@internationalized/date";
const EVENTS_API_URL = "/api/events";

async function createEvent (
  event: SelfieEvent,
) : Promise<boolean> {
  try {
    const res = await fetch(`${EVENTS_API_URL}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: event }),
      cache: 'no-store' // This ensures fresh data on every request
    });

    if (res.status === 401) {
      throw new AuthenticationError('Unauthorized, please login.');
    } else if (res.status >= 500) {
      throw new ServerError(`Server error: ${res.statusText}`);
    } else if (!res.ok) {
      throw new Error('Failed to create events');
    }

  } catch (error) {
    console.error("Error saving note:", error);
    return false;
  }

  return await res.json;
}

export default function NewElementAdder() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [eventData, setEventData] = useState<SelfieEvent>(null);

  const handleOpen = (type) => {
    setModalType(type);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    // Qui puoi aggiungere la logica per gestire l'invio del form

    console.log("event: ", event);
    try {  
      const success = createEvent(event);

      console.log("Form submitted");
    } catch (e) {
      throw new Error('Error submitting event', e.message);
    }
    handleClose();
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="bordered" 
            className="rounded-full text-size-80 transition-all duration-500 bg-gradient-to-bl from-blue-600 from-20% via-sky-500 via-40% to-emerald-600 to-90% hover:text-slate-700"
          >
            Nuovo ...
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem key="event" className="text-pink-300" description="Aggiungi nuovo evento" onPress={() => handleOpen("Evento")}>
            Evento
          </DropdownItem>
          <DropdownItem key="activity" className="text-teal-300" description="Aggiungi una nuova attività" onPress={() => handleOpen("Attività")}>
            Attività
          </DropdownItem>
          <DropdownItem key="project" className="text-sky-300" description="Aggiungi nuovo progetto" onPress={() => handleOpen("Progetto")}>
            Progetto
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Nuovo {modalType}</ModalHeader>
          <ModalBody>
            <form onSubmit={(e) => handleSubmit(e)}>
              <Input
                label="Titolo"
                placeholder="Inserisci il titolo"
                className="mb-4"
              />
              <div className="flex gap-4 mb-4">
                <EventDatePicker value={allDayEvent} />
                <Switch isSelected={allDayEvent} onValueChange={setAllDayEvent}> Tutto il giorno </Switch>
              </div>
              <div className="flex pb-4 gap-4">
                <Switch isSelected={repeatEvent} onValueChange={setRepeatEvent}> Si ripete </Switch> 
                <RepetitionMenu value={repeatEvent} />
              </div>
              <Input
                label="Luogo"
                placeholder="Inserisci il luogo"
                className="mb-4"
              />
              <Textarea
                label="Descrizione"
                placeholder="Inserisci una descrizione"
                className="mb-4"
              />
              <Input
                label="Partecipanti"
                placeholder="Inserisci i partecipanti (separati da virgola)"
                className="mb-4"
              />
              <Input
                label="Tag"
                placeholder="Inserisci i partecipanti (separati da virgola)"
                className="mb-4"
              />
              <div className="flex gap-4 mb-4">
                <Input
                  label="Numero di notifiche"
                  min="0"
                  className="py-0 flex-1"
                />
                <div className="flex content-middle items-center" >
                  <Switch> Abilita notifiche </Switch>
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={handleSubmit}>
              Salva
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
