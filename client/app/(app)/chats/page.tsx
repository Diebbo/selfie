'use server';
import { Content } from '@/components/chats/content';
import { getChats } from '@/actions/chats';
import { cookies } from 'next/headers';
import { getFriends } from '@/actions/friends';

export default async function Home() {
  try {
    const [chats, friends] = await Promise.all([
      getChats(),
      getFriends(),
    ]);
    return (
      <Content chats={chats} friends={friends}/>
    );
  } catch (error) {
    console.error(error);
  }
};
