"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";

const RepetitionMenu = (value: boolean) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isDisabled={!value}>Ogni quanto</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="daily">Giorno</DropdownItem>
        <DropdownItem key="weekly">Settimana</DropdownItem>
        <DropdownItem key="monthly">Mese</DropdownItem>
        <DropdownItem key="yearly">Anno</DropdownItem>
        <DropdownItem key="custom" className="text-danger" color="danger">
          Personalizza
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default RepetitionMenu;
