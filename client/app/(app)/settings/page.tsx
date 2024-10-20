"use server";
import Content from "@/components/settings/content";
import { getEmail, getUsername } from "@/actions/auth.action";

const Page = async () => {
  try {
    const user = await getUsername();
    const email = await getEmail();

    return <Content username={user.username} email={email.email} />;
  } catch (error) {
    return <Content username="" email="" />;
  }
};

export default Page;
