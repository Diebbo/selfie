import { Avatar, Card, CardBody } from "@nextui-org/react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { ChatModel } from "@/helpers/types";

interface PropContent {
  chats: ChatModel[];
}

export const CardChats = ({ chats }: PropContent) => {
  const router = useRouter();
  const handleClick = (chat: ChatModel) => {
    try {
      const path = `/chats/${chat.username}`;
      router.push(path);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Card className="bg-default-50 rounded-xl shadow-md px-4 py-0 w-full">
      <CardBody className="py-5 gap-4">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border-dashed border-2 border-divider py-1 px-6 rounded-xl">
            <span className="text-default-900 text-xl font-semibold">
              Latest Chats
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-6 overflow-x-auto p-3">
          {chats && chats.length > 0 ? (
            chats.map((item, index) => (
              <Button
                key={index}
                color="default"
                variant="ghost"
                className="flex flex-nowrap flex-row gap-5 justify-between w-full py-4 h-20 min-w-[100%]"
                onClick={() => handleClick(item)}
              >
                <div>
                  <Avatar
                    isBordered
                    color="secondary"
                    src={item.avatar}
                  />
                </div>

                <span className="text-default-900 font-semibold max-w-[6rem] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.username}
                </span>

                <div className="max-w-[9rem] overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-success text-xs">
                    {item.lastMessage.message}
                  </span>
                </div>

                <div className="justify-self-end">
                  <span className="text-default-500 text-xs">
                    {new Date(item.lastMessage.createdAt).toTimeString().split(" ")[0]}
                  </span>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-success">No chats</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
