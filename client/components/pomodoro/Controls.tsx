import React from "react";
import { Button } from "@nextui-org/react";
import {
  PlayIcon,
  PauseIcon,
  CogIcon,
  ForwardIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

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
        <PauseIcon style={{ width: 20, height: 20 }} />
      ) : (
        <PlayIcon style={{ width: 20, height: 20 }} />
      )}
    </Button>
    <Button onClick={handleSkip}>
      <ForwardIcon style={{ width: 20, height: 20 }} />
    </Button>
    <Button onClick={handleReset}>
      <ArrowPathIcon style={{ width: 20, height: 20 }} />
    </Button>
    <Button onClick={onOpen}>
      <CogIcon style={{ width: 20, height: 20 }} />
    </Button>
  </div>
);

export default Controls;