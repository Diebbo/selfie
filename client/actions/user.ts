"use server";

import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { Person, TaskModel } from "@/helpers/types";

async function fetchWithErrorHandling(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
  return response;
}

export async function getUser(): Promise<Person | Error> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetchWithErrorHandling(`${getBaseUrl()}/api/users/id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.toString()}`,
      },
    });

    const userData = await response.json();

    const person: Person = {
      ...userData,
      events: {
        created: userData.events,
        participating: userData.participatingEvents,
      },
    };

    return person;
  } catch (error) {
    return new Error("Failed to fetch user data");
  }
}

export async function getUserByUsername(username: string): Promise<Person | Error> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetchWithErrorHandling(`${getBaseUrl()}/api/users/usernames/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.toString()}`,
      },
    });

    const userData = await response.json();

    const person: Person = {
      ...userData,
      events: {
        created: userData.events,
        participating: userData.participatingEvents,
      },
    };

    return person;
  } catch (error) {
    return new Error("Failed to fetch user data");
  }
}


export async function getEmail(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetchWithErrorHandling(`${getBaseUrl()}/api/auth/email`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  return await response.json();
}

export async function getUserTasks(): Promise<TaskModel> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetchWithErrorHandling(`${getBaseUrl()}/api/user/tasks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  return await response.json();
}

export async function updateGPS(position: { latitude: number; longitude: number }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  await fetchWithErrorHandling(`${getBaseUrl()}/api/users/gps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    body: JSON.stringify(position),
  });
}


export async function isAdmin(): Promise<Boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/users/admin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
  });

  const isAdmin = await response.json()
  console.log(isAdmin);

  return isAdmin
}
