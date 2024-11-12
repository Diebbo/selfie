"use server";
import Content from "@/components/settings/content";
import {
  getNotificationStatus,
} from "@/actions/auth.action";
import { getUser, isAdmin } from "@/actions/user";
import { getEvents, getResource } from "@/actions/events";

const Page = async () => {
  try {
    const [user, events, notifications, resource, admin] = await Promise.all([
      getUser(),
      getEvents(),
      getNotificationStatus(),
      getResource(),
      isAdmin(),
    ]);

    // console.log("miao", user);
    // console.log("events page", events);
    // console.log("risorse", resource);

    return (
      <Content
        username={user.username}
        events={events}
        email={user.email}
        pushNotifications={notifications?.pushOn}
        emailNotifications={notifications?.emailOn}
        avatar={user.avatar}
        resource={resource}
        isAdmin={admin}
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
        resource={null}
        isAdmin={false}
      />
    );
  }
};

export default Page;
