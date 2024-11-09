import getBaseUrl from "@/config/proxy";
import { tokenToId } from "@/jose";
import { cookies } from "next/headers";

async function getFriends() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/friends`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "force-cache",
    next: {
      tags: [await tokenToId(token)],
    },
  });
  return await res.json();
}

export { getFriends };
