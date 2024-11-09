"use server";

import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { TaskModel } from "@/helpers/types";
import { TaskResponse, TaskMutiResponse } from "@/helpers/api-types";
import { tokenToId } from "@/jose";
import { customRevalidate } from "./user";

export async function getTasks(): Promise<TaskMutiResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/activities`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.toString()}`,
    },
    cache: "force-cache",
    next: {
      tags: [await tokenToId(token)],
    },
  });

  const { activities, message } = await res.json();

  return { activities, message, success: res.ok };
}

export async function addTaskToParent(
  task: Partial<TaskModel>,
  parent: TaskModel,
): Promise<TaskResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(
    `${getBaseUrl()}/api/activities?parent=${parent._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.toString()}`,
      },
      body: JSON.stringify({ activity: task }),
    },
  );

  customRevalidate();

  if (!res.ok) {
    return Promise.reject(new Error("Error adding task"));
  }

  const { activity, message }: { activity: TaskModel; message: string } =
    await res.json();

  return { activity, message, success: res.ok };
}

export async function addTask(task: Partial<TaskModel>): Promise<TaskResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${getBaseUrl()}/api/activities`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.toString()}`,
    },
    body: JSON.stringify({ activity: task }),
  });

  customRevalidate();

  const { activity, message }: { activity: TaskModel; message: string } =
    await res.json();

  return { activity, message, success: res.ok };
}

export async function saveTask(task: TaskModel): Promise<TaskResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${getBaseUrl()}/api/activities/${task._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.toString()}`,
    },
    body: JSON.stringify({ activity: task }),
  });

  customRevalidate();

  const { activity, message }: { activity: TaskModel; message: string } =
    await res.json();

  return { activity, message, success: res.ok };
}

export async function saveTaskInParent(
  task: TaskModel,
  parent: TaskModel,
): Promise<TaskResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  parent.subActivities = parent.subActivities.map((subTask: TaskModel) => {
    if (subTask._id === task._id) {
      return task;
    }
    return subTask;
  });

  const res = await fetch(`${getBaseUrl()}/api/activities/${parent._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.toString()}`,
    },
    body: JSON.stringify({ activity: parent }),
  });

  customRevalidate();

  const { activity, message }: { activity: TaskModel; message: string } =
    await res.json();

  return { activity, message, success: res.ok };
}

export async function deleteTask(task: TaskModel): Promise<TaskResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${getBaseUrl()}/api/activities/${task._id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.toString()}`,
    },
  });

  customRevalidate();

  const { activity, message }: { activity: TaskModel; message: string } =
    await res.json();
  return { activity, message, success: res.ok };
}
