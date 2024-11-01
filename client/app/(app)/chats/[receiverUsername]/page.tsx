"use client";
import ChatModal from "@/components/chats/ChatModal";

export default async function Page({ params }: { params: Promise < { receiverUsername: string } > }) {
  const { receiverUsername } = await params;
  return <ChatModal receiverUsername={receiverUsername} />;
}
