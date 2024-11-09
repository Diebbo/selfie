"use server";
import { PomodoroSettings } from "@/helpers/types";
import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { AuthenticationError, ServerError } from "@/helpers/errors";
import { tokenToId } from "@/jose";

export async function getSettings() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/pomodoro/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "force-cache",
    next: {
      tags: [await tokenToId(token)],
    },
  });

  if (res.status === 401) {
    throw new AuthenticationError("Unauthorized, please login.");
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  return await res.json();
}

export async function getStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/pomodoro/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "force-cache",
    next: {
      tags: [await tokenToId(token)],
    },
  });

  if (res.status === 401) {
    throw new AuthenticationError("Unauthorized, please login.");
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  return await res.json();
}
