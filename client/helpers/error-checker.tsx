import React, { ReactElement } from 'react';

export function showError(g: any | Error): ReactElement {
	if (g instanceof Error) {
		return (
			<p className='text-center text-error'>{g.message}</p>
		);
	}
	return <> </>;
}
