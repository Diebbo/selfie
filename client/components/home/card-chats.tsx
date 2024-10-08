import { Avatar, Card, CardBody } from "@nextui-org/react";
import React from "react";
import { useRouter } from 'next/navigation';
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
    <Card className=" bg-default-50 rounded-xl shadow-md px-3">
      <CardBody className="py-5 gap-4">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
            <span className="text-default-900 text-xl font-semibold">
              Latest Chats
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 ">
          {
            chats && chats.length > 0 ? (
              chats.map((item, index) => (
                <Button
                  key={index}
                  color="default"
                  variant="ghost"
                  className="flex flex-nowrap flex-row gap-5 justify-start w-full py-4 h-20"
                  onClick={() => handleClick(item)}
                >
                  <div >
                    <Avatar
                      isBordered
                      color="secondary"
                      src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                    />
                  </div>

                  <span className="text-default-900 font-semibold max-w-[6rem] overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.username}
                  </span>

                  <div className="max-w-[8rem] overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-success text-xs">
                      {item.lastMessage}
                    </span>
                  </div>

                  <div className="max-w-[4rem] ml-auto">
                    <span className="text-default-500 text-xs">
                      {new Date(item.date).toLocaleTimeString()}
                    </span>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-success">No chats</div>
            )
          }
        </div>
      </CardBody>
    </Card>
  );
};
