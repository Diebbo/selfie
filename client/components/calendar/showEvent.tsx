import React, { useState, useContext } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  DateRangePicker,
} from "@nextui-org/react";
import { SelfieEvent } from "@/helpers/types";
import { parseDate } from "@internationalized/date";
import { reloadContext } from "./reloadContext";

interface ShowEventProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: SelfieEvent | null;
}

const ShowEvent: React.FC<ShowEventProps> = ({
  isOpen,
  onClose,
  selectedEvent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<SelfieEvent | null>(null);
  const EVENTS_API_URL = "/api/events";
  const { reloadEvents, setReloadEvents } = useContext(reloadContext) as any;

  const handleEdit = () => {
    console.log(selectedEvent);
    setIsEditing(true);
    setEditedEvent(selectedEvent);
  };

  const handleReset = () => {
    //Risettare tutti i campi come prima
  }

  const handlePatch = () => {
    // Implement save logic here
    setIsEditing(false);
    // Update the selectedEvent with editedEvent
  };

  async function deleteEvent() {
    try {
      var res = await fetch(`${EVENTS_API_URL}/${selectedEvent?._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized, please login.");
      } else if (res.status >= 500) {
        throw new Error(`Server error: ${res.statusText}`);
      } else if (!res.ok) {
        throw new Error("Failed to delete events");
      }
    } catch (e: unknown) {
      throw new Error(`Error during delete event: ${(e as Error).message}`);
    }
  }

  const handleDelete = () => {
    // Implement delete logic here
    deleteEvent();
    setReloadEvents(true);
    onClose();
  };

  if (!selectedEvent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <span>Vedi Evento</span>
          <div className="justify-end">
            <Button className="mx-2" onClick={handleReset}>
              Annulla
            </Button>
            <Button className="mx-2 mr-4" onClick={handleEdit} isDisabled={isEditing} >
              Modifica
            </Button>
          </div>
        </ModalHeader>
        <ModalBody>
          <Input
            isReadOnly={true}
            label="Titolo"
            name="title"
            value={selectedEvent.title as string}
            placeholder="Inserisci il titolo"
            className="mb-4"
          />
          <DateRangePicker
            label="Event duration"
            className="max-w-[430px] mb-4"
            hideTimeZone
            defaultValue={{
              start: parseDate("2024-04-01"),
              end: parseDate("2024-04-08"),
            }} visibleMonths={2}
            isReadOnly={true}
          />
          <Input
            isReadOnly={true}
            label="Descrizione"
            name="description"
            value={selectedEvent.description as string}
            placeholder="Inserisci il titolo"
            className="mb-4"
          />
          <Input
            isReadOnly={true}
            label="Categorie"
            name="categories"
            value={selectedEvent.categories?.join(", ")}
            className="mb-4"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleDelete}>
            Elimina Evento
          </Button>
          <Button color="primary" onPress={isEditing ? handlePatch : onClose}>
            {isEditing ? "Salva" : "Chiudi"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal >
  );
};

export default ShowEvent;
