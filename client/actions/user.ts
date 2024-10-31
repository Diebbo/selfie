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
  const person: Person = userData as Person;
  // const person: Person = {
  //   _id: userData._id as string,
  //   avatar: "",
  //   friends: userData.friends as Person[],
  //   events: {
  //     created: userData.events as SelfieEvent[],
  //     participating: userData.participatingEvents as SelfieEvent[],
  //   },
  //   username: userData.username as string,
  //   password: userData.password as string,
  //   name: userData.name as string,
  //   surname: userData.surname as string,
  //   email: userData.email as string,
  //   birthDate: new Date(userData.birthDate as string),
  //   address: userData.address as string,
  //   city: userData.city as string,
  //   state: userData.state as string,
  //   zip: userData.zip as string,
  //   country: userData.country as string,
  //
  // };

  return person;
}

export { getUser };
