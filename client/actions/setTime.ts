// @/actions/setTime.ts
'use server';

import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';

export async function changeCurrentTime(time: Date) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
console.log(token);

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${getBaseUrl()}/api/config/time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token}`,
    },
    body: JSON.stringify({ date: time.toISOString() }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return await response.json();
}
