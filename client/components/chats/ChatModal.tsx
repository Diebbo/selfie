"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageModel, StatusEnum, Person } from "@/helpers/types";
import {
  Modal,
  ModalContent,
  Input,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Button,
  Spinner,
} from "@nextui-org/react";
import { io } from "socket.io-client";

interface ChatModalProps {
  receiverUsername: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  receiverUsername,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [currentUser, setCurrentUser] = useState<Person | null>(null);
  const [receiver, setReceiver] = useState<Person | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null); const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getChatByUsername = async (username: string): Promise<MessageModel[]> => {
    const res = await fetch(`/api/chats/messages/${username}`);
    if (!res.ok) throw new Error("Failed to fetch chat");
    return res.json();
  };

  const getUser = async (): Promise<Person> => {
    const res = await fetch('/api/users/id');
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  };

  const getUserByUsername = async (username: string): Promise<Person> => {
    const res = await fetch(`/api/users/usernames/${username}`);
    if (!res.ok) throw new Error("Failed to fetch receiver");
    return res.json();
  };

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, receiverData, chatMessages] = await Promise.all([
          getUser(),
          getUserByUsername(receiverUsername),
          getChatByUsername(receiverUsername)
        ]);

        setCurrentUser(user);
        setReceiver(receiverData);
        setMessages(chatMessages);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, [receiverUsername]);

  // start socket connection
  useEffect(() => {
    if (!currentUser) return;
    // Initialize socket connection
    socketRef.current = io("https://site232454.tw.cs.unibo.it");

    // Join the chat
    socketRef.current.emit("join", {
      userId: currentUser._id,
      username: currentUser.username,
      receiverUsername,
    });

    // Listen for incoming messages
    socketRef.current.on("receive_message", (newMessage: MessageModel) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
      // Send read receipt
      if (newMessage._id) {
        socketRef.current.emit("message_read", { messageId: newMessage._id });
      }
    });

    // Handle typing indicators
    socketRef.current.on("user_typing", (data: { username: string }) => {
      if (data.username === receiverUsername) {
        setIsTyping(true);
      }
    });

    socketRef.current.on(
      "user_stopped_typing",
      (data: { username: string }) => {
        console.log("user_stopped_typing", data);
        if (data.username === receiverUsername) {
          setIsTyping(false);
        }
      },
    );

    socketRef.current.on(
      "message_status",
      (data: { messageId: string; status: string }) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id === data.messageId) {
              return { ...msg, status: data.status as StatusEnum };
            }
            return msg;
          }),
        );
      },
    );

    // Listen for online/offline events
    socketRef.current.on("user_online", (data: any) => {
      const { username } = data;
      updateUserStatus(username, true);
    });

    socketRef.current.on("user_offline", (data: any) => {
      const { username } = data;
      updateUserStatus(username, false);
    });

    // Function to update user status in the UI
    function updateUserStatus(username: string, isOnline: boolean) {
      if (username === receiverUsername) {
        setIsOnline(isOnline);
      }
    }

    socketRef.current.on("message_sent", (data: MessageModel) => {
      setMessages((prev) => [...prev, data]);
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
  }, [currentUser, receiverUsername]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      if (message && socketRef.current) {
        // Send message through WebSocket
        socketRef.current.emit("private_message", {
          message,
          receiverUsername,
        });

        // Clear input
        setMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;

    setMessage(e.target.value);

    // Emit typing start
    if (e.target.value !== "") {
      socketRef.current?.emit("typing_start", {
        senderUsername: currentUser.username,
        receiverUsername,
      });
    } else {
      socketRef.current?.emit("typing_end", {
        senderUsername: currentUser.username,
        receiverUsername,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout for typing end
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing_end", {
        senderUsername: currentUser.username,
        receiverUsername,
      });
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!currentUser || !receiverUsername) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      socketRef.current?.emit("typing_end", {
        senderUsername: currentUser.username,
        receiverUsername,
      });
      handleSendMessage();
    }
  };

  const handleClose = () => {
    socketRef.current.disconnect();
    router.refresh();
    router.push("/chats");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={handleClose}>
        <ModalContent>
          <ModalBody className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error || !currentUser || !receiver) {
    return (
      <Modal isOpen={true} onClose={handleClose}>
        <ModalContent>
          <ModalBody className="flex items-center justify-center py-8">
            <p className="text-danger">Error loading chat: {error}</p>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
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
          <h3 className="text-lg font-semibold">
            {isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span className="text-gray-500">Offline</span>
            )}{" "}
            {receiverUsername}
          </h3>
          {isTyping && <p className="text-sm text-gray-500">typing...</p>}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`flex gap-5 ${msg.sender === currentUser.username
                  ? "flex-row-reverse"
                  : "flex-row"
                  }`}
              >
                <Avatar
                  isBordered
                  radius="full"
                  size="sm"
                  src={
                    msg.sender === currentUser.username
                      ? currentUser.avatar
                      : receiver?.avatar
                  }
                />
                <div
                  className={`flex flex-col gap-1 max-w-[70%] ${msg.sender === currentUser.username ? "items-end" : "items-start"
                    }`}
                >
                  <p
                    className={`px-4 py-2 rounded-lg ${msg.sender === currentUser.username
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                      }`}
                  >
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
