import React, { useState } from 'react';
import {
  Slider,
  Chip,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input
} from "@nextui-org/react";
import { Person, SelfieEvent } from "@/helpers/types";

interface ParticipantsSliderProps {
  participants: Person[];
  owner: string;
  isEditing: boolean;
  onAddParticipant?: (participant: Person) => void;
  onRemoveParticipant?: (participant: Person) => void;
}

const ParticipantsSlider: React.FC<ParticipantsSliderProps> = ({
  participants,
  owner,
  isEditing,
  onAddParticipant,
  onRemoveParticipant
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [potentialParticipants, setPotentialParticipants] = useState<Person[]>([]);

  const otherParticipants = participants.filter(p => p._id !== owner);

  const handleRemoveParticipant = (participant: Person) => {
    if (onRemoveParticipant && participant._id !== owner) {
      onRemoveParticipant(participant);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Here you would typically fetch potential participants based on searchTerm
    // For now, this is a placeholder
    setPotentialParticipants([]);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <span>Participants:</span>
        {isEditing && (
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button size="sm" variant="flat">
                Add Participant
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2 w-full">
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search participants"
                  className="mb-2"
                />
                {potentialParticipants.map(participant => (
                  <Button
                    key={participant._id}
                    size="sm"
                    variant="flat"
                    className="w-full mb-1"
                    onPress={() => onAddParticipant?.(participant)}
                  >
                    {participant.username}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Slider
        size="md"
        step={1}
        color="primary"
        marks={[
          { value: 0, label: "First" },
          { value: participants.length - 1, label: "Last" }
        ]}
        className="max-w-full"
      >
        <Chip
          variant="solid"
          color="primary"
          className="m-1"
        >
          {owner} (Owner)
        </Chip>
        {otherParticipants.map(participant => (
          <Chip
            key={participant._id}
            variant={isEditing ? "bordered" : "solid"}
            color={isEditing ? "secondary" : "default"}
            onClose={isEditing ? () => handleRemoveParticipant(participant) : undefined}
            className="m-1"
          >
            {participant.username}
          </Chip>
        ))}
      </Slider>
    </div>
  );
};

export default ParticipantsSlider;
