import React from 'react';
import { Image } from "@nextui-org/react";

interface Props {
	children: React.ReactNode;
}

export const TimeLayoutWrapper = ({ children }: Props) => {
	return (
		<div className='flex h-screen'>
			<div className='flex-1 flex-col flex items-center justify-center p-6'>
				<div className='md:hidden absolute left-0 right-0 bottom-0 top-0 z-0'>
					<Image
						className='w-full h-full'
						src='https://nextui.org/gradients/docs-right.png'
						alt='gradient'
					/>
				</div>
				{children}
			</div>
		</div>
	);
}
