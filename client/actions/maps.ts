import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { AuthenticationError, ServerError } from "@/helpers/errors";
import { SelfieEvent } from "@/helpers/types";

export type MapEvent = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  location: string;
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

  const events: SelfieEvent[] = await res.json();

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
    }));
}
