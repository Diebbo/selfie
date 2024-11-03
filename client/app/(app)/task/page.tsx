"use server";

import React from "react";
import Content from "@/components/task/taskContent";
import { getTasks } from "@/actions/tasks";

const Page = async () => {
  const res = await getTasks() ?? [];
  const tasks = Object(res).activity
  console.log(tasks);
  try {
    return (
      <Content
        tasks={tasks}
      />);
  } catch (error) {
    console.log(error);
  }
}

export default Page;
