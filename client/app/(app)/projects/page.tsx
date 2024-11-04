'use server';
import { getUser } from "@/actions/user";
import getProjects from "@/actions/projects";
import Content from "@/components/projects/content";


export default async function Page() {
  try {
    const projects = await getProjects();
    const user = await getUser();
    return <Content projects={projects} user={user} />;
  } catch (error: any) {
    return <div className="text-error">{error.message}</div>;
  }
}
