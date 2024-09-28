'use server';
import { Content } from '@/components/chats/content';
import { getChats } from '@/actions/chats';
import { cookies } from 'next/headers';

export default async function Home() {
  try {
    const chats = await getChats();
    return (
      <Content chats={chats} />
    );
  } catch (error) {
    console.error(error);
  }
};
