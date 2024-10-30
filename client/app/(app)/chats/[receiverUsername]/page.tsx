"use client";
import ChatModal from "@/components/chats/ChatModal";

export default function Page({ params }: { params: { receiverUsername: string } }) {
  const { receiverUsername } = params;
  return <ChatModal receiverUsername={receiverUsername} />;
}
