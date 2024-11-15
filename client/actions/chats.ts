import { cookies } from 'next/headers';
import getBaseUrl from '@/config/proxy';
import { ChatModel, MessageModel } from '@/helpers/types';

async function getChats(): Promise<ChatModel[]> {
	const cookieStore = await cookies();
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

async function getChatByUsername(username: string) : Promise<MessageModel[] | Error> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	const res = await fetch(`${getBaseUrl()}/api/chats/messages/${username}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': `token=${token?.toString()}`,
		},
		cache: 'no-store' // This ensures fresh data on every request
	});

	if (!res.ok) {
		return new Error('Failed to fetch chat');
	}

	return await res.json();
}

export { getChats, getChatByUsername };
