"use server";
import Content from "@/components/settings/content";
import {
  getNotificationStatus,
} from "@/actions/auth.action";
import { getUser } from "@/actions/user";

const Page = async () => {
  try {
    const [user,notifications]  = await Promise.all([
      getUser(),
      getNotificationStatus(),
    ]);

    console.log("miao", user);

    return (
      <Content
        username={user.username}
        email={user.email}
        pushNotifications={notifications?.pushOn}
        emailNotifications={notifications?.emailOn}
        avatr={user.avatar}
      />
    );
  } catch (error) {
    return (
      <Content
        avatar=""
        username=""
        email=""
        pushNotifications={false}
        emailNotifications={false}
      />
    );
  }
};

export default Page;
