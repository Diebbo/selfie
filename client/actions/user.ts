"use server";

import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { Person, TaskModel } from "@/helpers/types";

export async function getUser(): Promise<Person> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/users/id`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  const userData = await response.json();

  const person: Person = {
    ...userData,
    events: {
      created: userData.events,
      participating: userData.participatingEvents,
    },
  };

  return person;
}


export async function getEmail(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/auth/email`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  return await response.json();
}


export async function getUserTasks(): Promise<TaskModel> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/user/tasks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  return await response.json();
}

export async function updateGPS(position: { latitude: number; longitude: number }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/users/gps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    body: JSON.stringify(position),
  });


  if (!response.ok) {
    throw new Error("Failed to update position");
  }
}
