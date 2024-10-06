import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';
import { AuthenticationError, ServerError } from '@/helpers/errors';
const EVENTS_API_ULR = "/api/events";

export const createEvent = async (
  event: EventModel,
) : Promise<boolean> => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const res = await fetch(`${getBaseUrl()}${NOTES_API_URL}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token.toString()}`,
      },
      body: JSON.stringify({ event: event }),
      cache: 'no-store' // This ensures fresh data on every request
    });

    if (res.status === 401) {
      throw new AuthenticationError('Unauthorized, please login.');
    } else if (res.status >= 500) {
      throw new ServerError(`Server error: ${res.statusText}`);
    } else if (!res.ok) {
      throw new Error('Failed to create events');
    }
    
    return await res.json;

  } catch (error) {
    console.error("Error saving note:", error);
    return false;
  }
}

export async function getEvents() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${getBaseUrl()}${NOTES_API_URL}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
    cache: 'no-store' // This ensures fresh data on every request
  });

  if (res.status === 401) {
    throw new AuthenticationError('Unauthorized, please login.');
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return await res.json();
}

