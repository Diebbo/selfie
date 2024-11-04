'use server';
import { Content } from '@/components/chats/content';
import { getFriends } from '@/actions/friends';

export default async function Page() {
  const [friends] = await Promise.all([
    getFriends(),
  ]);

  return (
    <Content friends={friends} />
  );
}
