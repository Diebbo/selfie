
import { Content } from '@/components/chats/content';
import { getChats } from '@/actions/chats';
import { getFriends } from '@/actions/friends';

export const fetchCache = 'force-no-store';

export default async function Page() {
  const [chats, friends] = await Promise.all([
    getChats(),
    getFriends(),
  ]);

  return (
    <Content initialChats={chats} friends={friends} />
  );
}
