import getBaseUrl from "@/config/proxy";
import { cookies } from "next/headers";

async function getFriends() {

	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const res = await fetch(`${getBaseUrl()}/api/friends`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
      'Cookie': `token=${token.toString()}`,
		},
		cache: "no-store",
	});
	return await res.json();
}

export { getFriends };
