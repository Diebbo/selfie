import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';

async function getChats() {
	const cookieStore = cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		throw new Error('Not authenticated');
	}

	const res = await fetch(`${getBaseUrl()}/api/chats`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': `token=${token.toString()}`,
		},
		cache: 'no-store' // This ensures fresh data on every request
	});

	if (!res.ok) {
		throw new Error('Failed to fetch chats');
	}

	return await res.json();
}

async function getChatByUsername(username: string) {
	const cookieStore = cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		throw new Error('Not authenticated');
	}

	const res = await fetch(`${getBaseUrl()}/api/chats/messages/${username}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': `token=${token.toString()}`,
		},
		cache: 'no-store' // This ensures fresh data on every request
	});

	if (!res.ok) {
		throw new Error('Failed to fetch chat');
	}

	return await res.json();
}

export { getChats, getChatByUsername };
