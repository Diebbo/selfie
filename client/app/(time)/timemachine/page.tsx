import React from 'react';
import TimeModifierClient from '@/components/timemachine/content';
import { cookies } from 'next/headers';
import { changeCurrentTime } from '@/actions/setTime';
import '@/styles/globals.css';

async function handleTimeChange() {
  'use server'
	const formData = new FormData();
  const time = formData.get('time') as string;
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    await changeCurrentTime(new Date(time));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default function TimeMachine() {
  return <TimeModifierClient onSubmit={handleTimeChange} />;
}

