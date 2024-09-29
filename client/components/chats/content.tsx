'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { ChatModel } from '@/helpers/types';
import { Card, CardHeader, CardBody, Avatar, Button } from "@nextui-org/react";

interface PropContent {
	chats: ChatModel[];
}

export const Content: React.FC<PropContent> = ({ chats }) => {
	const router = useRouter();

	const handleClick = (chat: ChatModel) => {
		router.push(`/chats/${chat.username}`);
	};

	return (
		<>
			<div className="p-5">
				<h3 className="text-xl font-semibold">Chats</h3>
				<Button color="success" radius="full" size="sm" variant="solid" className="max-w-[130px]" onPress={() => router.push('/chats/new')}>New Chat</Button>
			</div>
			<div className="flex flex-row p-5 gap-5 w-[100%] flex-wrap">
				{chats.length > 0 ? (
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
