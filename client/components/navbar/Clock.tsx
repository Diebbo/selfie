import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import TimeModifierClient from "@/components/timemachine/content";
import { changeCurrentTime, resetTime } from "@/actions/setTime";

import { useTime } from "../contexts/TimeContext";

export const Clock = () => {
  const { currentTime: time, setCurrentTime } = useTime();
  const [currentTimerTime, setCurrentTimerTime] = useState(time.getTime() ? new Date(time) : new Date());
  const [isOpen, setIsOpen] = useState(false);

  // Update the timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimerTime((prevTime: Date) => new Date(prevTime.getTime() + 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return <div>Loading...</div>;
  }

  const handleTimeChange = async (formData: FormData) => {
    const time = formData.get("time") as string;
    try {
      await changeCurrentTime(new Date(time));
      setCurrentTime(new Date(time));
      setCurrentTimerTime(new Date(time));
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.message };
    }
  };

  const handleTimeReset = async () => {
    try {
      await resetTime();
      setCurrentTime(new Date());
      setCurrentTimerTime(new Date());
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.message };
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 perché i mesi in JavaScript partono da 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div
        className="text-md font-light flex flex-col items-center leading-tight cursor-pointer hover:opacity-80"
        onClick={() => setIsOpen(true)}
      >
        <div>{formatDate(currentTimerTime)}</div>
        <div>{currentTimerTime.toLocaleTimeString()}</div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        size="sm"
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 items-center">
                Time Machine
              </ModalHeader>
              <ModalBody>
                <TimeModifierClient
                  onSubmit={handleTimeChange}
                  onReset={handleTimeReset}
                  onClose={() => setIsOpen(false)}
                  initialTime={time}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
