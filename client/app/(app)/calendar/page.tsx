import React from "react";
import CalendarPage from "@/components/calendar/calendar";

const Page = async () => {
  try {
    return <CalendarPage />;
  } catch (error) {
    console.log(error);
  }
};

export default Page;
