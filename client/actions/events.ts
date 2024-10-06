//import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';
import { AuthenticationError, ServerError } from '@/helpers/errors';
import { EventModel } from "../helpers/types";
const EVENTS_API_URL = "api/events";

//PROBLEMA getEvents è per i serverComponent mentre fetchEvents e le funzioni che sto facendo per il calendario sono clientComponent
// perchè fare i prendere gli eventi, metterli nella homePage/dashboard se poi non si possono modificare
// SOLUZIONE rendere clientComponent le card con gli event nella home aggiungendo delle funzioni tipo l'eliminazione e la modifica
// Oppure non mettere il calendario nella home page

/*export async function getEvents() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${getBaseUrl()}/${EVENTS_API_URL}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
    cache: 'no-store' // This ensures fresh data on every request
  });

  console.log(res);

  if (res.status === 401) {
    throw new AuthenticationError('Unauthorized, please login.');
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return await res.json();
}
*/

export async function fetchEvents() {
  try {
    console.log("sono qua");
    var res = await fetch(`${EVENTS_API_URL}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Sono io qua!!", res);

  } catch (e) {
    throw new Error("Error during fetch events, ", e.message);
  }

  return await res.json();
}

/* export const createEvent = async (
  event: EventModel,
) : Promise<boolean> => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const res = await fetch(`${getBaseUrl()}/`${EVENTS_API_URL}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        //'Cookie': `token=${token.toString()}`,
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
*/

