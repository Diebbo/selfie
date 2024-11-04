import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DarkModeSwitch } from "./darkmodeswitch";
import { deleteAuthCookie } from "@/actions/auth.action";
import { Person } from "@/helpers/types";
import { getUser } from "@/actions/user";

interface UserChangeEvents {
  updatedEmail: string;
  updatedAvatar: string;
}

export const UserDropdown = () => {
  const router = useRouter();
  const [user, setUser] = useState<Person | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      /*const res = await fetch("/api/users/id");
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }*/
      const dbUser = await getUser();
      setUser(dbUser);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await deleteAuthCookie();
    router.replace("/login");
  }, [router]);

  const handleChange = useCallback((event: CustomEvent<UserChangeEvents>) => {
    switch (event.type) {
      case "emailUpdated":
        setUser((prev) => ({ ...prev, email: event.detail.updatedEmail } as Person));
        break;
      case "avatarUpdated":
        console.log("Avatar updated:", event.detail.updatedAvatar);
        setUser((prev) => ({ ...prev, avatar: event.detail.updatedAvatar } as Person));
        break;
      default:
        console.error("Unknown event type:", event);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    window.addEventListener("emailUpdated", handleChange as EventListener);
    window.addEventListener("avatarUpdated", handleChange as EventListener);
    return () => {
      window.removeEventListener("emailUpdated", handleChange as EventListener);
      window.removeEventListener("avatarUpdated", handleChange as EventListener);
    };
  }, [fetchUser, handleChange]);

  const handleDropdownAction = (actionKey: string) => {
    switch (actionKey) {
      case "logout":
        handleLogout();
        break;
      case "settings":
        router.push("/settings");
        break;
      // Add other cases as needed
      default:
        console.log({ actionKey });
    }
  };

  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Avatar
            as="button"
            color="secondary"
            size="md"
            src={user?.avatar || ""}
          />
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu
        aria-label="User menu actions"
        onAction={handleDropdownAction as any}
      >
        <DropdownItem
          key="profile"
          className="flex flex-col justify-start w-full items-start"
        >
          <p>Signed in as</p>
          <p>{user?.email || "Loading..."}</p>
        </DropdownItem>
        <DropdownItem key="settings">My Settings</DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
        >
          Log Out
        </DropdownItem>
        <DropdownItem key="switch">
          <DarkModeSwitch />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
