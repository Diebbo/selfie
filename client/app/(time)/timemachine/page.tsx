import React from 'react';
import TimeModifierClient from '@/components/timemachine/content';
import { changeCurrentTime } from '@/actions/setTime';
import '@/styles/globals.css';

async function handleTimeChange(formData: FormData) : Promise<{ success: boolean, error?: string }>{
	'use server'
	const time = formData.get('time') as string;

	try {
		await changeCurrentTime(new Date(time));
		return { success: true };
	} catch (error: any) {
		console.log(error);
		return { success: false, error: error.message };
	}
}

export default function TimeMachine() {
	return <TimeModifierClient onSubmit={handleTimeChange} />;
}

