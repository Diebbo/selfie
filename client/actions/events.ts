import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';

export async function getEvents() {
  const cookieStore = cookies();
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

  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return await res.json();
}
