import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { AuthenticationError, ServerError } from "@/helpers/errors";
import { SelfieEvent } from "@/helpers/types";

export type MapEvent = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  location: string;
  dtstart: Date;
  dtend: Date;
};

export type MapFriend = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export async function getEvents(): Promise<MapEvent[]> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/events`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new AuthenticationError("Unauthorized, please login.");
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const events = await res.json();

  // Filtra e trasforma gli eventi
  return events
    .filter(
      (event: SelfieEvent) =>
        event.geo &&
        typeof event.geo.lat === "number" &&
        typeof event.geo.lon === "number",
    )
    .map((event: SelfieEvent) => ({
      id: event._id,
      name: event.title,
      lat: event.geo.lat,
      lng: event.geo.lon,
      location: event.location,
      description: event.description,
      dtstart: new Date(event.dtstart),
      dtend: new Date(event.dtend),
    }));
}

export async function getFriends(): Promise<MapFriend[]> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/friends`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new AuthenticationError("Unauthorized, please login.");
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error("Failed to fetch friends");
  }

  const users = await res.json();

  // Filtra gli utenti che hanno una posizione valida e trasformali nel formato MapFriend
  return users
    .filter(
      (user: any) =>
        user.position &&
        typeof user.position.latitude === "number" &&
        typeof user.position.longitude === "number",
    )
    .map(
      (user: any): MapFriend => ({
        id: user._id,
        name:
          user.username || `${user.name || ""} ${user.surname || ""}`.trim(),
        lat: user.position.latitude,
        lng: user.position.longitude,
      }),
    );
}
