'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { ChatModel, People, Person } from '@/helpers/types';
import { Card, CardHeader, CardBody, Avatar, Button, Popover, PopoverTrigger, PopoverContent, Spinner } from "@nextui-org/react";

interface PropContent {
    friends: People;
}

export const Content: React.FC<PropContent> = ({ friends }) => {
    const [chats, setChats] = React.useState<ChatModel[]>([]);
    const [loading, setLoading] = React.useState(true);

    const router = useRouter();

    React.useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/chats');
                const data = await res.json();
                setChats(data);
            } catch (error) {
                console.error('Error fetching chats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    const handleClick = (chat: ChatModel) => {
        router.push(`/chats/${chat.username}`);
    };

    const handleNewChat = async (bro: Person) => {
        const res = await fetch(`/api/chats/${bro.username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await res.json();
        if (!res.ok) {
            console.error(data);
            return;
        }
        setChats(data);
        router.push(`/chats/${bro.username}`);
    };

    return (
        <>
            <div className="p-5">
                <h3 className="text-xl font-semibold">Chats</h3>
                <Popover>
                    <PopoverTrigger>
                        <Button color="success" radius="full" size="sm" variant="solid" className="max-w-[130px]">New Chat</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="flex flex-col gap-2 p-5">
                            {friends.map((friend, index) => (
                                <Button
                                    key={index}
                                    color="default"
                                    radius="full"
                                    size="sm"
                                    variant="shadow"
                                    onPress={() => handleNewChat(friend)}
                                >
                                    {friend.username}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex flex-row p-5 gap-5 w-[100%] flex-wrap">
                {loading ? (
                    <div className="flex items-center justify-center w-full">
                        <Spinner size="lg" />
                    </div>
                ) : chats.length > 0 ? (
                    chats.map((chat, index) => (
                        <Card key={index} className="max-h-[100px] min-w-[300px]">
                            <CardHeader className="justify-between">
                                <div className="flex gap-5">
                                    <Avatar isBordered radius="full" size="md" src="https://nextui.org/avatars/avatar-1.png" />
                                    <div className="flex flex-col gap-1 items-start justify-center">
                                        <h4 className="text-small font-semibold leading-none text-default-600">{chat.username}</h4>
                                    </div>
                                </div>
                                <Button
                                    color="primary"
                                    radius="full"
                                    size="sm"
                                    variant="solid"
                                    onPress={() => handleClick(chat)}
                                >
                                    Chat with
                                </Button>
                            </CardHeader>
                            <CardBody className="px-3 py-0 text-small text-default-400">
                                <p>{chat.lastMessage}</p>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <div className="text-success">No chats yet</div>
                )}
            </div>
        </>
    );
};
