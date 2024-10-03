"use client";
import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Button,
  Modal,
  Input,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import {
  PlayIcon,
  PauseIcon,
  BookOpenIcon,
  BeakerIcon,
  CogIcon,
} from "@heroicons/react/24/solid";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";

export default function Content() {
  const [focusTime, setFocusTime] = useState(25); // 25 minuti
  const [breakTime, setBreakTime] = useState(5); // 5 minuti
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [percentage, setPercentage] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusTime, setIsFocusTime] = useState(true);

  const [focusTimeInput, setFocusTimeInput] = useState(focusTime);
  const [breakTimeInput, setBreakTimeInput] = useState(breakTime);
  const [longBreakTimeInput, setLongBreakTimeInput] = useState(900); // Default 15 minuti

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsFocusTime(!isFocusTime);
      setTimeLeft(isFocusTime ? breakTime : focusTime);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isRunning, timeLeft, isFocusTime]);

  useEffect(() => {
    const focusTimeInSeconds = focusTime * 60;
    const breakTimeInSeconds = breakTime * 60;
    setPercentage(
      (timeLeft / (isFocusTime ? focusTimeInSeconds : breakTimeInSeconds)) * 100
    );
  }, [timeLeft, isFocusTime, focusTime, breakTime]);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch("/api/pomodoro/settings");
      const data = await response.json();
      setFocusTimeInput(data.studyDuration);
      setBreakTimeInput(data.shortBreakDuration);
      setLongBreakTimeInput(data.longBreakDuration);
      setTimeLeft(data.studyDuration * 60);
      setFocusTime(data.studyDuration);
      setBreakTime(data.shortBreakDuration);
    };

    fetchSettings();
  }, []);

  const handleButtonClick = () => {
    setIsRunning(!isRunning);
  };

  const handleSaveSettings = async () => {
    const settings = {
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
      body: JSON.stringify(settings),
    });

    setTimeLeft(focusTimeInput * 60);
    setFocusTime(focusTimeInput);
    setBreakTime(breakTimeInput);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: !isRunning
          ? "#E0FFFF" // Azzurro molto chiaro quando il timer è fermo
          : isFocusTime
          ? "#FFE4E1" // Rosso molto chiaro quando è Focus Time
          : "#F0FFF0", // Verde molto chiaro quando è Break Time
      }}
    >
      <Card style={{ padding: "15px" }}>
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
              backgroundColor: !isRunning
                ? "#E0FFFF" // Azzurro molto chiaro quando il timer è fermo
                : isFocusTime
                ? "#FFFACD" // Giallo chiaro quando è Focus Time
                : "#FFDAB9", // Pesca chiaro quando è Break Time
              border: `2px solid ${
                !isRunning
                  ? "#00CED1" // Turchese scuro quando il timer è fermo
                  : isFocusTime
                  ? "#FFD700" // Oro quando è Focus Time
                  : "#FF6347" // Rosso arancio quando è Break Time
              }`,
              marginBottom: "20px",
            }}
          >
            {!isRunning ? (
              <span>Pomodoro Timer</span>
            ) : isFocusTime ? (
              <>
                <BookOpenIcon
                  style={{ width: 20, height: 20, marginRight: 10 }}
                />
                <span>Focus Time</span>
              </>
            ) : (
              <>
                <BeakerIcon
                  style={{ width: 20, height: 20, marginRight: 10 }}
                />
                <span>Break Time</span>
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 200,
            }}
          >
            <CircularProgressbar
              value={percentage}
              text={formatTime(timeLeft)}
              strokeWidth={2}
              styles={buildStyles({
                pathTransitionDuration: 1,
                textSize: "25px",
                textColor: "#000000",
              })}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "30px",
              justifyContent: "center",
            }}
          >
            <Button onClick={handleButtonClick}>
              {isRunning ? (
                <PauseIcon style={{ width: 20, height: 20 }} />
              ) : (
                <PlayIcon style={{ width: 20, height: 20 }} />
              )}
            </Button>
            <Button onClick={onOpen}>
              <CogIcon style={{ width: 20, height: 20 }} />
            </Button>
          </div>
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2>Impostazioni</h2>
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Durata Focus Time (minuti)"
                  type="number"
                  value={focusTimeInput.toString()}
                  onChange={(e) => setFocusTimeInput(Number(e.target.value))}
                />
                <Input
                  label="Durata Break Time (minuti)"
                  type="number"
                  value={breakTimeInput.toString()}
                  onChange={(e) => setBreakTimeInput(Number(e.target.value))}
                />
                <Input
                  label="Durata Long Break Time (minuti)"
                  type="number"
                  value={longBreakTimeInput.toString()}
                  onChange={(e) =>
                    setLongBreakTimeInput(Number(e.target.value))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => {
                    handleSaveSettings();
                    onClose();
                  }}
                >
                  Salva
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

