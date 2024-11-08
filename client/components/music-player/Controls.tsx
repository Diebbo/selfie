import { Button } from "@nextui-org/react";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { PreviousIcon } from "./PreviousIcon";
import { PlayCircleIcon } from "./PlayIcon";
import { NextIcon } from "./NextIcon";
import { ShuffleIcon } from "./ShuffleIcon";
import { PauseIcon } from "./PauseIcon";

interface ControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRepeat: () => void;
  onShuffle: () => void;
  isPlaying: boolean;
  repeat: boolean;
  shuffle: boolean;
}

const Controls = ({
  onPlayPause,
  onNext,
  onPrev,
  onRepeat,
  onShuffle,
  isPlaying,
  repeat,
  shuffle,
}: ControlsProps) => {
  return (
    <div className="flex w-full items-center justify-evenly m-auto">
      <Button
        isIconOnly
        className="data-[hover]:bg-foreground/10"
        radius="full"
        variant="light"
        onPress={onRepeat}
      >
        <RepeatOneIcon
          className={repeat ? "text-blue-500/80" : "text-foreground/80"}
        />
      </Button>
      <Button
        isIconOnly
        className="data-[hover]:bg-foreground/10"
        radius="full"
        variant="light"
        onPress={onPrev}
      >
        <PreviousIcon />
      </Button>
      <Button
        isIconOnly
        className="w-auto h-auto data-[hover]:bg-foreground/10"
        radius="full"
        variant="light"
        onPress={onPlayPause}
      >
        {isPlaying ? <PauseIcon size={54} /> : <PlayCircleIcon size={54} />}
      </Button>
      <Button
        isIconOnly
        className="data-[hover]:bg-foreground/10"
        radius="full"
        variant="light"
        onPress={onNext}
      >
        <NextIcon />
      </Button>
      <Button
        isIconOnly
        className="data-[hover]:bg-foreground/10"
        radius="full"
        variant="light"
        onPress={onShuffle}
      >
        <ShuffleIcon
          className={shuffle ? "text-blue-500/80" : "text-foreground/80"}
        />
      </Button>
    </div>
  );
};

export default Controls;
