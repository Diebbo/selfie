"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Input,
} from "@nextui-org/react";
import { FrequencyType } from "@/helpers/types";

const frequencyOptions = {
  daily: "Giorno",
  weekly: "Settimana",
  monthly: "Mese",
  yearly: "Anno",
};

interface RepetitionMenuProps {
  value: boolean;
  frequency: string | undefined;
  onChange: (frequency: FrequencyType) => void;
}

const RepetitionMenu: React.FC<RepetitionMenuProps> = ({
  value,
  frequency,
  onChange,
}) => {
  const handleSelectionChange = (key: FrequencyType) => {
    onChange(key);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isDisabled={!value}
          className={`${value ? "mt-[0.5rem]" : null}`}
        >
          {value ? "Ogni " + frequency : "Ogni ..."}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Repetition Frequency"
        onAction={(key) => handleSelectionChange(key as FrequencyType)}
      >
        {Object.entries(frequencyOptions).map(([key, label]) => (
          <DropdownItem key={key}>{label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default RepetitionMenu;
