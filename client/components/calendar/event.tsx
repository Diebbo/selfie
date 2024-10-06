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
import {parseZonedDateTime} from "@internationalized/date";
import createEvent from "@/actions/events"

export default function NewElementAdder() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [allDayEvent, setAllDayEvent] = useState(false);

  const handleOpen = (type) => {
    setModalType(type);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Qui puoi aggiungere la logica per gestire l'invio del form
    
    //const success = await createEvent(event);
    console.log("Form submitted");
    handleClose();
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="bordered" 
            className="rounded-full text-size-80 hover:bg-blue-400"
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
            <form onSubmit={handleSubmit}>
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
