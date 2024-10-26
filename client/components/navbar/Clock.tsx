import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import TimeModifierClient from "@/components/timemachine/content";
import {
  changeCurrentTime,
  resetTime,
  getCurrentTime,
} from "@/actions/setTime";

export const Clock = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch the current time from the server (db)
  async function fetchCurrentTime() {
    try {
      const res = await fetch("/api/config/time", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized, please login.");
      } else if (res.status >= 500) {
        throw new Error(`Server error: ${res.statusText}`);
      } else if (!res.ok) {
        throw new Error("Failed to get date time");
      }

      const serverTime = new Date(await res.json());
      setTime(serverTime);
    } catch (e) {
      console.error("Error during fetching date time: ", e);
    }
  }

  // Update the timer every second
  useEffect(() => {
    fetchCurrentTime();

    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime) {
          return new Date(prevTime.getTime() + 1000);
        }
        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!time) {
    return <div>Loading...</div>;
  }

  const handleTimeChange = async (formData: FormData) => {
    const time = formData.get("time") as string;
    try {
      await changeCurrentTime(new Date(time));
      await fetchCurrentTime();
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.message };
    }
  };

  const handleTimeReset = async () => {
    try {
      await resetTime();
      await fetchCurrentTime();
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.message };
    }
  };

  const handleGetCurrentTime = async () => {
    try {
      const result = await getCurrentTime();
      return { currentTime: result.currentTime };
    } catch (error: any) {
      console.log(error);
      return { currentTime: "", error: error.message };
    }
  };

  if (!time) {
    return <div>Loading...</div>;
  }

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
        <div>{formatDate(time)}</div>
        <div>{time.toLocaleTimeString()}</div>
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
                  onGetCurrentTime={handleGetCurrentTime}
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
