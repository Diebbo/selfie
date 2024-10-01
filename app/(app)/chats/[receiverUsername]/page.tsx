import ChatModal from '@/components/chats/ChatModal';
import { getChatByUsername } from '@/actions/chats';  // Assume you have this API helper
import { MessageModel } from '@/helpers/types';

const ChatPage = async ({ params }: { params: { receiverUsername: string } }) => {
  const { receiverUsername } = params;
  const messages = await getChatByUsername(receiverUsername);  // Get the chat object using receiverUsername

  if (!messages) {
    return <div>No chat found</div>;
  }

  return (
    <ChatModal receiverUsername={receiverUsername} initialMessages={messages as MessageModel[]} />
  );
};

export default ChatPage;
