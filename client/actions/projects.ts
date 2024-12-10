import getBaseUrl from "@/config/proxy";
import { ProjectModel } from "@/helpers/types";
import { cookies } from "next/headers";

async function getProjects(): Promise<ProjectModel[]> {
  const cookieStore = await cookies();
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

  const projects = await response.json();

  return projects;
}

export default getProjects;
