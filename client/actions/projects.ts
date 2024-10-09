import getBaseUrl from "@/config/proxy";
import { cookies } from "next/headers";
async function getProjects() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    throw new Error("Unauthorized");
  }
  const response = await fetch(`${getBaseUrl()}/api/projects`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token.toString()}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return await response.json();
}

export default getProjects;
