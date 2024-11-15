import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

export function showError(g: any | Error): ReactJSXElement {
	if (g instanceof Error) {
		return (
			<p className='text-center text-error'>{g.message}</p>
		);
	}
	return <> </>;
}
