'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { MessageModel, StatusEnum } from '@/helpers/types';
import { Modal, ModalContent, Input, ModalHeader, ModalBody, ModalFooter, Avatar, Button } from "@nextui-org/react";
import { io } from "socket.io-client";

interface ChatModalProps {
    receiverUsername: string;
    initialMessages: MessageModel[];
    currentUsername: string;
    currentUserId: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
    receiverUsername,
    initialMessages,
    currentUsername,
    currentUserId
}) => {
    const router = useRouter();
    const [messages, setMessages] = useState<MessageModel[]>(initialMessages);
    const [message, setMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef<any>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('http://localhost:8000');

        // Join the chat
        socketRef.current.emit('join', {
            userId: currentUserId,
            username: currentUsername
        });

        // Listen for incoming messages
        socketRef.current.on('receive_message', (newMessage: MessageModel) => {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
            // Send read receipt
            if (newMessage._id) {
                socketRef.current.emit('message_read', { messageId: newMessage._id });
            }
        });

        // Handle typing indicators
        socketRef.current.on('user_typing', (data: { username: string }) => {
            if (data.username === receiverUsername) {
                setIsTyping(true);
            }
        });

        socketRef.current.on('user_stopped_typing', (data: { username: string }) => {
            if (data.username === receiverUsername) {
                setIsTyping(false);
            }
        });

        socketRef.current.on('message_status', (data: { messageId: string, status: string }) => {
            setMessages(prev => prev.map(msg => {
                if (msg._id === data.messageId) {
                    return { ...msg, status: data.status as StatusEnum };
                }
                return msg;
            }));
        });

        socketRef.current.on('message_sent', (data: MessageModel) => {
            setMessages(prev => [...prev, data]);
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [currentUserId, currentUsername, receiverUsername]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        try {
            if (message && socketRef.current) {
                // Send message through WebSocket
                socketRef.current.emit('private_message', {
                    message,
                    receiverUsername
                });

                // Clear input
                setMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        // Emit typing start
        socketRef.current?.emit('typing_start', { senderUsername:currentUsername, receiverUsername });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout for typing end
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('typing_end', { receiverUsername });
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClose = () => {
        socketRef?.current.disconnect();
        router.refresh();
        router.push('/chats');
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            backdrop="blur"
            scrollBehavior="inside"
            placement="center"
            isOpen={true}
            onClose={handleClose}
            isDismissable={false}
            className="max-h-[80vh]"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{receiverUsername}</h3>
                    {isTyping && (
                        <p className="text-sm text-gray-500">typing...</p>
                    )}
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={msg._id || idx}
                                className={`flex gap-5 ${msg.sender === currentUsername ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <Avatar
                                    isBordered
                                    radius="full"
                                    size="sm"
                                    src="/api/placeholder/40/40"
                                />
                                <div className={`flex flex-col gap-1 max-w-[70%] ${msg.sender === currentUsername ? "items-end" : "items-start"
                                    }`}>
                                    <p className={`px-4 py-2 rounded-lg ${msg.sender === currentUsername
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-gray-800"
                                        }`}>
                                        {msg.message}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className="flex flex-row gap-5 w-full">
                        <Input
                            className="flex-grow"
                            radius="full"
                            placeholder="Type your message"
                            value={message}
                            onChange={handleMessageInput}
                            onKeyPress={handleKeyPress}
                        />
                        <Button
                            color="primary"
                            radius="full"
                            size="sm"
                            variant="solid"
                            onPress={handleSendMessage}
                        >
                            Send
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChatModal;
