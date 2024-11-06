"use server";

import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { TaskModel } from "@/helpers/types";

interface TaskResponse {
  activities: TaskModel[];
  message: string;
}

const defaultTask: TaskModel = {
  name: "",
  dueDate: new Date(),
  completed: false,
  participants: [],
  subActivity: []
};

export async function getTasks(): Promise<TaskResponse> {
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

  const { activities, message } = await res.json();

  if (!res.ok) {
    return Promise.reject(new Error(message));
  }

  return { activities, message };
}

export async function addTaskToParent(task: Partial<TaskModel>, parent: TaskModel): Promise<{activity:TaskModel, message:string}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  let fetchTask = { ...defaultTask, ...task };

  const res = await fetch(`${getBaseUrl()}/api/activities?parent=${parent._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
    },
    body: JSON.stringify({ activity: fetchTask }),
  });

  if (!res.ok) {
    return Promise.reject(new Error("Error adding task"));
  }

  return await res.json();
}

export async function addTask(task: Partial<TaskModel>): Promise<{activity:TaskModel, message:string}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  let fetchTask = { ...defaultTask, ...task };

  const res = await fetch(`${getBaseUrl()}/api/activities`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
    },
    body: JSON.stringify({ activity: fetchTask }),
  });

  if (!res.ok) {
    return Promise.reject(new Error("Error adding task"));
  }

  const { activity, message }: { activity: TaskModel, message:string} = await res.json();

  return { activity, message };
}

export async function saveTask(task: TaskModel): Promise<TaskModel> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/activities/${task._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
    },
    body: JSON.stringify({ activity: task }),
  });

  const { activity }: { activity: TaskModel } = await res.json();
  return activity;
}

export async function saveTaskInParent(task: TaskModel, parent: TaskModel): Promise<TaskModel> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  parent.subActivity = parent.subActivity.map((subTask:TaskModel) => {
    if (subTask._id === task._id) {
      return task;
    }
    return subTask;
  });

  const res = await fetch(`${getBaseUrl()}/api/activities/${parent._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
    },
    body: JSON.stringify({ activity: parent }),
  });

  const { activity }: { activity: TaskModel } = await res.json();
  return activity;
}

export async function deleteTask(task: TaskModel): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  await fetch(`${getBaseUrl()}/api/activities/${task._id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
    },
  });
}

