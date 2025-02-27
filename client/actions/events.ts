"use server";

import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';
import { AuthenticationError, ServerError } from '@/helpers/errors';
import { Person, SelfieEvent, ResourceModel } from '@/helpers/types';

export async function getEventWithOwner(eventid: string): Promise<SelfieEvent & { owner: Partial<Person> } | Error> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${getBaseUrl()}/api/events/${eventid}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
    cache: 'no-store' // This ensures fresh data on every request
  });

  const data = await res.json();
  if (!res.ok) {
    return new Error(data.message);
  }

  return data;
}

export async function getEvents(): Promise<SelfieEvent[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${getBaseUrl()}/api/events`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
    cache: 'no-store' // This ensures fresh data on every request
  });

  const data = await res.json();
  if (res.status === 401) {
    throw new AuthenticationError('Unauthorized, please login.');
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return data;
}

export async function getEventv2(id: string): Promise<SelfieEvent | Error> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${getBaseUrl()}/api/events/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
    cache: 'no-store' // This ensures fresh data on every request
  });

  const data = await res.json();
  if (!res.ok) {
    return new Error(data.message);
  }

  return data;
}

export async function getEvent(eventid: string): Promise<SelfieEvent> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${getBaseUrl()}/api/events/${eventid}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
    cache: 'no-store' // This ensures fresh data on every request
  });

  const data = await res.json();
  console.log(data);

  if (res.status === 401) {
    throw new AuthenticationError('Unauthorized, please login.');
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error(`Failed to fetch event: ${res.statusText}`);
  }

  return data;
}


export async function getOwner(ownerid: String): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/events/owner/${ownerid}`, {
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

  const owner = await response.json();

  return owner;
}


export async function getResource(): Promise<ResourceModel[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/events/resource/all`, {
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

  const resource = await response.json();

  return resource;
}
