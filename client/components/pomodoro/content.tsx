"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { Card, CardBody } from "@nextui-org/react";
import Wave from "react-wavify";

function pomodoro() {
  const [focusTime, setFocusTime] = useState(25); // 25 minuti
  const [breakTime, setBreakTime] = useState(5); // 5 minuti
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [percentage, setPercentage] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusTime, setIsFocusTime] = useState(true);
  const [targetHeight, setTargetHeight] = useState(2000);
  const [currentHeight, setCurrentHeight] = useState(2000);
  const animationRef = useRef<number>();

  const [focusTimeInput, setFocusTimeInput] = useState(focusTime);
  const [breakTimeInput, setBreakTimeInput] = useState(breakTime);
  const [longBreakTimeInput, setLongBreakTimeInput] = useState(900); // Default 15 minuti

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 0.1); // Aggiorna ogni 100ms per l'animazione dell'onda
      }, 100);
    } else if (timeLeft <= 0) {
      setIsFocusTime(!isFocusTime);
      setTimeLeft(isFocusTime ? breakTime * 60 : focusTime * 60);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isRunning, timeLeft, isFocusTime]);

  useEffect(() => {
    const focusTimeInSeconds = focusTime * 60;
    const breakTimeInSeconds = breakTime * 60;
    setPercentage(
      (timeLeft / (isFocusTime ? focusTimeInSeconds : breakTimeInSeconds)) *
        100,
    );
    setTargetHeight(
      (timeLeft / (isFocusTime ? focusTimeInSeconds : breakTimeInSeconds)) *
        820,
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

  useEffect(() => {
    const animateHeight = () => {
      setCurrentHeight((prevHeight) => {
        const diff = targetHeight - prevHeight;
        const newHeight = prevHeight + diff * 0.1; // Adjust the 0.1 for faster/slower animation
        if (Math.abs(newHeight - targetHeight) < 0.1) {
          return targetHeight;
        }
        return newHeight;
      });
      animationRef.current = requestAnimationFrame(animateHeight);
    };

    animationRef.current = requestAnimationFrame(animateHeight);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetHeight]);

  useEffect(() => {
    const updateWaveHeight = () => {
      const screenHeight = window.innerHeight;
      setTargetHeight(screenHeight);
      setCurrentHeight(screenHeight);
    };

    window.addEventListener("resize", updateWaveHeight);

    return () => {
      window.removeEventListener("resize", updateWaveHeight);
    };
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
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
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
            ? "#FFF3E2" // Giallo molto chiaro quando è Focus Time
            : "#F0FFF0", // Verde molto chiaro quando è Break Time
      }}
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
          height: currentHeight,
          amplitude: 20,
          speed: 0.16,
          points: 4,
        }}
      />
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
              <p className="text-black">Pomodoro Timer</p>
            ) : isFocusTime ? (
              <>
                <BookOpenIcon
                  style={{ width: 20, height: 20, marginRight: 10 }}
                  className="text-black"
                />
                <p className="text-black">Focus Time</p>
              </>
            ) : (
              <>
                <BeakerIcon
                  style={{ width: 20, height: 20, marginRight: 10 }}
                  className="text-black"
                />
                <p className="text-black">Break Time</p>
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

export default pomodoro;
