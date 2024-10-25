import ChatModal from '@/components/chats/ChatModal';
import { getChatByUsername } from '@/actions/chats';  // Assume you have this API helper
import { MessageModel } from '@/helpers/types';
import { getUser } from '@/actions/user';  

const ChatPage = async ({ params }: { params: { receiverUsername: string } }) => {
  const { receiverUsername } = params;
  const messages = await getChatByUsername(receiverUsername); 
  const user = await getUser();

  if (!messages) {
    return <div>No chat found</div>;
  }

  return (
    <ChatModal currentUsername={user.username} currentUserId={user._id} receiverUsername={receiverUsername} initialMessages={messages as MessageModel[]} />
  );
};

export default ChatPage;
