import React, { useState, useEffect } from "react";

export const Clock = () => {
  const [time, setTime] = useState<Date | null>(null);

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
  }, []);

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
    <div className="text-md font-light flex flex-col items-center leading-tight">
      <div>{formatDate(time)}</div>
      <div>{time.toLocaleTimeString()}</div>
    </div>
  );
};
