'use server';
import getProjects from "@/actions/projects"; 
import Content from "@/components/projects/content";


export default async function Page() {
  try {
  const projects = await getProjects();
  return <Content projects={projects} />;
  } catch (error: any) {
    return <div className="text-error">{error.message}</div>;
  }
}
