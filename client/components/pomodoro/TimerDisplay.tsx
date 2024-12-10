import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface TimerDisplayProps {
  percentage: number;
  timeLeft: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ percentage, timeLeft }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div style={{ width: 200 }}>
      <CircularProgressbar
        value={percentage}
        text={formatTime(timeLeft)}
        strokeWidth={2}
        styles={buildStyles({
          pathTransitionDuration: 1,
          textSize: "25px",
        })}
      />
    </div>
  );
};

export default TimerDisplay;