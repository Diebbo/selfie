import React from "react";
import { Button } from "@nextui-org/react";

import { Cog, Play, Pause, SkipForward, RotateCcw } from "lucide-react";

interface ControlsProps {
  isRunning: boolean;
  toggleRunning: () => void;
  handleSkip: () => void;
  handleReset: () => void; // nuova prop
  onOpen: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isRunning,
  toggleRunning,
  handleSkip,
  handleReset,
  onOpen,
}) => (
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "30px",
      justifyContent: "center",
    }}
  >
    <Button onClick={toggleRunning}>
      {isRunning ? (
        <Pause size={20} strokeWidth={1.5} />
      ) : (
        <Play size={20} strokeWidth={1.5} />
      )}
    </Button>
    <Button onClick={handleSkip}>
      <SkipForward size={20} strokeWidth={1.5} />
    </Button>

    <Button onClick={handleReset}>
      <RotateCcw size={20} strokeWidth={1.5} />
    </Button>
    <Button onClick={onOpen}>
      <Cog size={20} strokeWidth={1.5} />
    </Button>
  </div>
);

export default Controls;
