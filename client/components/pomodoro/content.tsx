"use client";
import React, { useState } from "react";
import { useDisclosure, Card, CardBody } from "@nextui-org/react";
import Wave from "react-wavify";
import { BookOpenIcon, BeakerIcon } from "@heroicons/react/24/solid";
import usePomodoroTimer from "../hooks/usePomodoroTimer";
import TimerDisplay from "./TimerDisplay";
import Controls from "./Controls";
import SettingsModal from "./SettingsModal";
import { PomodoroSettings } from "@/helpers/types";
import { getSettings } from "@/actions/pomodoro";

interface PomodoroProps {
  settings: PomodoroSettings;
}

const Pomodoro: React.FC<PomodoroProps> = ({ settings }) => {
  const { state, toggleRunning, toggleSession, reset } =
    usePomodoroTimer(settings);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [focusTimeInput, setFocusTimeInput] = useState(settings.studyDuration);
  const [breakTimeInput, setBreakTimeInput] = useState(
    settings.shortBreakDuration,
  );
  const [longBreakTimeInput, setLongBreakTimeInput] = useState(
    settings.longBreakDuration,
  );

  const handleSkip = () => {
    toggleSession();
  };

  const handleReset = async () => {
    const settings = await getSettings();
    reset(settings);
  };

  const handleSaveSettings = async (now: boolean) => {
    const newSettings = {
      settings: {
        studyDuration: focusTimeInput,
        shortBreakDuration: breakTimeInput,
        longBreakDuration: longBreakTimeInput,
      },
    };

    await fetch("/api/pomodoro/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSettings),
    });

    if (now) {
      reset(newSettings.settings);
    }
  };

  let backgroundColor: string;
  let borderColor: string;
  let icon = null;
  let label = "";

  if (!state.isRunning) {
    backgroundColor = "#E0FFFF";
    borderColor = "#00CED1";
    label = "Pomodoro Timer";
  } else {
    switch (state.sessionType) {
      case "focus":
        backgroundColor = "#FFF3E2";
        borderColor = "#FFD700";
        icon = (
          <BookOpenIcon
            style={{ width: 20, height: 20, marginRight: 10 }}
            className="text-black"
          />
        );
        label = "Focus Time";
        break;
      case "shortBreak":
        backgroundColor = "#F0FFF0";
        borderColor = "#32CD32";
        icon = (
          <BeakerIcon
            style={{ width: 20, height: 20, marginRight: 10 }}
            className="text-black"
          />
        );
        label = "Short Break";
        break;
      case "longBreak":
        backgroundColor = "#FFDAB9";
        borderColor = "#FF6347";
        icon = (
          <BeakerIcon
            style={{ width: 20, height: 20, marginRight: 10 }}
            className="text-black"
          />
        );
        label = "Long Break";
        break;
      default:
        backgroundColor = "#E0FFFF";
        borderColor = "#00CED1";
        label = "Pomodoro Timer";
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: backgroundColor,
        position: "relative",
      }}
      className="h-full"
    >
      <Wave
        fill="#ff6363"
        paused={false}
        style={{
          display: "flex",
          position: "absolute",
          bottom: 0,
          height: "100%",
        }}
        options={{
          height: state.waveHeight,
          amplitude: 30,
          speed: 0.16,
          points: 4,
        }}
      />
      <Card style={{ padding: "20px" }}>
        <CardBody
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: "20px",
              backgroundColor: backgroundColor,
              border: `2px solid ${borderColor}`,
              marginBottom: "20px",
            }}
          >
            {icon}
            <p className="text-black">{label}</p>
          </div>
          <TimerDisplay
            percentage={state.percentage}
            timeLeft={state.timeLeft}
          />
          <Controls
            isRunning={state.isRunning}
            toggleRunning={toggleRunning}
            handleSkip={handleSkip}
            handleReset={handleReset}
            onOpen={onOpen}
          />
        </CardBody>
      </Card>
      <SettingsModal
        isOpen={isOpen}
        isRunning={state.isRunning}
        onClose={onClose}
        focusTimeInput={focusTimeInput}
        setFocusTimeInput={setFocusTimeInput}
        breakTimeInput={breakTimeInput}
        setBreakTimeInput={setBreakTimeInput}
        longBreakTimeInput={longBreakTimeInput}
        setLongBreakTimeInput={setLongBreakTimeInput}
        handleSaveSettings={handleSaveSettings}
      />
    </div>
  );
};

export default Pomodoro;
