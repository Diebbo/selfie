import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
  Badge,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { NotificationIcon } from "../icons/navbar/notificationIcon";

interface Notification {
  title: string;
  body: string;
  link: string;
}

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/users/inbox", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error fetching notifications",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <NavbarItem>
          <Badge
            content={notifications.length}
            color="danger"
            shape="circle"
            size="md"
            className="mr-1 mt-1"
            isInvisible={notifications.length === 0}
          >
            <NotificationIcon />
          </Badge>
        </NavbarItem>
      </DropdownTrigger>
      <DropdownMenu
        className="w-60"
        aria-label="Notifications"
        variant="flat"
        color="success"
      >
        <DropdownSection title="Notifiche">
          {isLoading ? (
            <DropdownItem>Loading...</DropdownItem>
          ) : error ? (
            <DropdownItem>Error: {error}</DropdownItem>
          ) : notifications.length === 0 ? (
            <DropdownItem>No notifications</DropdownItem>
          ) : (
            notifications.map((notification, index) => (
              <DropdownItem
                key={index}
                classNames={{
                  base: "py-2",
                  title: "text-base font-semibold",
                }}
                description={notification.body}
                href={notification.link}
              >
                {notification.title}
              </DropdownItem>
            ))
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
