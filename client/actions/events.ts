"use server";

import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';
import { AuthenticationError, ServerError } from '@/helpers/errors';
import { SelfieEvent } from '@/helpers/types';

export async function getEvents() {
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

  if (res.status === 401) {
    throw new AuthenticationError('Unauthorized, please login.');
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error('Failed to fetch event');
  }

  return data;
}
