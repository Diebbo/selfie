"use client";

import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

export default function EventAdder() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="bordered" className="rounded-full text-size-80 hover:bg-blue-400"
        >
          Nuovo ...
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="event" className="text-pink-300" description="Aggiungi nuovo evento" > Evento </DropdownItem>
        <DropdownItem key="activity" className="text-teal-300" description="Aggiungi una nuova attività" > Attività </DropdownItem>
        <DropdownItem key="project" className="text-sky-300" description="Aggiungi nuovo progetto" > Progetto </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}


