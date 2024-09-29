// File: /components/ChatModal.tsx
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { MessageModel } from '@/helpers/types';
import { Modal, ModalContent, Input, ModalHeader, ModalBody, ModalFooter, Avatar, Button } from "@nextui-org/react";

interface ChatModalProps {
    receiverUsername: string;
    initialMessages: MessageModel[];
}

const ChatModal: React.FC<ChatModalProps> = ({ receiverUsername, initialMessages }) => {
    const router = useRouter();
    const [messages, setMessages] = useState<MessageModel[]>(initialMessages);
    const [message, setMessage] = useState<string>('');

    const handleSendMessage = async () => {
        try {
            if (message) {
                const res = await fetch(`/api/chats/messages/${receiverUsername}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                    }),
                });
                if (res.ok) {
                    const newMessage = await res.json();
                    setMessages([...messages, newMessage]);
                    setMessage('');
                } else {
                    console.error('Failed to send message');
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleClose = () => {
        router.push('/chats');  // Go back to the main chats page
    };

    return (
        <Modal backdrop="blur" scrollBehavior="inside" placement="center" isOpen={true} onClose={handleClose}>
            <ModalContent>
                <ModalHeader>{receiverUsername}</ModalHeader>
                <ModalBody>
                    {messages.length > 0 ? (
                        messages.map((msg, idx) => (
                            <div key={idx} className={"flex gap-5 " + (msg.sender === receiverUsername ? "flex-row" : "flex-row-reverse")} >
                                <Avatar isBordered radius="full" size="md" src="https://nextui.org/avatars/avatar-1.png" />
                                <div className="flex flex-col gap-1 items-start justify-center">
                                    <h4 className="text-small font-semibold leading-none text-default-600">{msg.sender}</h4>
                                    <p className="text-small text-default-400">{msg.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No messages yet</div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <div className="flex flex-flow-row gap-5">
                        <Input
                            className="m-r-5 lg:min-w-[300px] w-full"
                            radius="full"
                            type="text"
                            placeholder="Type your message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button color="primary" radius="full" size="sm" variant="solid" onPress={() => handleSendMessage()}>
                            Send
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChatModal;
