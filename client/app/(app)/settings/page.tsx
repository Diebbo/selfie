"use server";
import Content from "@/components/settings/content";
import {
  getNotificationStatus,
} from "@/actions/auth.action";
import { getUser } from "@/actions/user";
import { getEvents } from "@/actions/events";

const Page = async () => {
  try {
    const [user, events, notifications] = await Promise.all([
      getUser(),
      getEvents(),
      getNotificationStatus(),
    ]);

    console.log("miao", user);

    return (
      <Content
        username={user.username}
        events={events}
        email={user.email}
        pushNotifications={notifications?.pushOn}
        emailNotifications={notifications?.emailOn}
        avatar={user.avatar}
      />
    );
  } catch (error) {
    return (
      <Content
        avatar=""
        username=""
        events={null}
        email=""
        pushNotifications={false}
        emailNotifications={false}
      />
    );
  }
};

export default Page;
