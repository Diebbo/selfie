"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { FrequencyType } from "@/helpers/types";

const frequencyOptions: Record<FrequencyType, string> = {
  daily: "Giorno",
  weekly: "Settimana",
  monthly: "Mese",
  yearly: "Anno",
};

interface RepetitionMenuProps {
  value: boolean;
  frequency: FrequencyType | undefined;
  isMobile: Boolean;
  onChange: (frequency: FrequencyType) => void;
}

function getFrequencyLabel(key: FrequencyType): string {
  return frequencyOptions[key];
}

const RepetitionMenu: React.FC<RepetitionMenuProps> = ({
  value,
  frequency,
  isMobile,
  onChange,
}) => {
  const handleSelectionChange = (key: FrequencyType) => {
    onChange(key);
  };

  return (
    <div className={`${isMobile ? "flex flex-wrap gap-2 w-full" : ""}`}>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isDisabled={!value}
            className="mt-[0.5rem]"
          >
            {value ? "Ogni " + getFrequencyLabel(frequency as FrequencyType) : "Ogni ..."}
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
    </div>
  );
};

export default RepetitionMenu;
