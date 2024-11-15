"use server";
import ChatModal from "@/components/chats/ChatModal";
import { getChatByUsername } from "@/actions/chats";
import { Suspense } from "react";
import { getUser, getUserByUsername } from "@/actions/user";

export default async function Page({ params }: { params: Promise<{ receiverUsername: string }> }) {
  try {
    const { receiverUsername } = await params;
    const [chat, user, receiver] = await Promise.all([
      getChatByUsername(receiverUsername),
      getUser(),
      getUserByUsername(receiverUsername),
    ]);

    if (chat instanceof Error) {
      throw chat;
    }

    if (user instanceof Error) {
      throw user;
    }

    if (receiver instanceof Error) {
      throw receiver;
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ChatModal receiverUsername={receiverUsername} chat={chat} user={user} receiver={receiver} />;
      </Suspense>
    );
  } catch (error: any) {
    return <div className="text-danger">{error}</div>;
  }
}
