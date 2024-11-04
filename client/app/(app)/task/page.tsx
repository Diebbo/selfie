'use server'

import React from "react";
import Content from "@/components/task/taskContent";
import { getTasks } from "@/actions/tasks";

const Page = async () => {
  try {
    const { activities, message } = await getTasks();
    console.log(message);
    return (
      <Content
        tasks={activities}
      />);
  } catch (error) {
    console.error(error);
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-3xl text-gray-800">Error fetching taks</h2>
      </div>
    );
  }
}

export default Page;
