"use server";
import Content from "@/components/settings/content";
import {
  getEmail,
  getNotificationStatus,
  getUsername,
} from "@/actions/auth.action";
import { revalidatePath } from "next/cache";

const Page = async () => {
  try {
    const [user, email, notifications] = await Promise.all([
      getUsername(),
      getEmail(),
      getNotificationStatus(),
    ]);

    return (
      <Content
        username={user.username}
        email={email.email}
        pushNotifications={notifications?.pushOn}
        emailNotifications={notifications?.emailOn}
      />
    );
  } catch (error) {
    return (
      <Content
        username=""
        email=""
        pushNotifications={false}
        emailNotifications={false}
      />
    );
  }
};

export default Page;
