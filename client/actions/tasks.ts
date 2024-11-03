"use server";

import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { TaskModel } from "@/helpers/types";

async function getTasks(): Promise<TaskModel[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/activities`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
    },
    cache: "no-store",
  });

  const tasks = await res.json();
  console.log("tasks", tasks);

  return tasks;
}

export { getTasks };
