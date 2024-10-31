"use server";

import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { Person, SelfieEvent } from "@/helpers/types";

async function getUser(): Promise<Person> {
  const cookieStore = cookies();
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

export { getUser };
