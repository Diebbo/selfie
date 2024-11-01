'use server';
import { getUser } from "@/actions/user";
import getProjects from "@/actions/projects";
import Content from "@/components/projects/single-content";


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params;
    const projects = await getProjects();
    const user = await getUser();
    return <Content projects={projects} user={user} id={id}/>;
  } catch (error: any) {
    return <div className="text-error">{error.message}</div>;
  }
}
