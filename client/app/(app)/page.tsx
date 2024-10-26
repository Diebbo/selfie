// page.tsx (Server-Side Component)

import { getChats } from "@/actions/chats";
import { Content } from "@/components/home/content";
import { getUser } from "@/actions/user";
import { ChatModel, Person, ProjectModel } from "@/helpers/types";
import getProjects from "@/actions/projects";

export default async function Home() {
  try {
    const [user, chats, projects]: [Person, ChatModel[], ProjectModel[]] = await Promise.all([
      getUser(),
      getChats(),
      getProjects(),
    ]);

    console.log("User p:", projects);

    // Pass the fetched data to the client-side component
    return (
      <>
        <Content events={user.events} chats={chats} friends={user.friends} user={user} projects={projects} />
      </>
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return <div>Unexpected error occurred. Please try again later.</div>;
  }
}
