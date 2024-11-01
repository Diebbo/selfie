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

  const handleEmailUpdate = useCallback((event: CustomEvent<string>) => {
    setUser(prevUser => prevUser ? { ...prevUser, email: event.detail } : null);
  }, []);

  useEffect(() => {
    fetchUser();

    window.addEventListener("emailUpdated", handleEmailUpdate as EventListener);
    return () => {
      window.removeEventListener("emailUpdated", handleEmailUpdate as EventListener);
    };
  }, []); // Remove user dependency

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
        <DropdownItem key="team_settings">Team Settings</DropdownItem>
        <DropdownItem key="analytics">Analytics</DropdownItem>
        <DropdownItem key="system">System</DropdownItem>
        <DropdownItem key="configurations">Configurations</DropdownItem>
        <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
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
