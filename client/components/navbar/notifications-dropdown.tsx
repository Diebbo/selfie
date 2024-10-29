import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
  Badge,
} from "@nextui-org/react";
import React, { useEffect, useState, useRef } from "react";
import { NotificationIcon } from "../icons/navbar/notificationIcon";
import { io } from "socket.io-client";
import { ToastNotification } from "./toast-notification";
import { CloseIcon } from "../icons/close-icon";

interface Notification {
  _id: string;
  title: string;
  body: string;
  link: string;
}

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const fetchNotifications = async () => {
    try {
      console.log("FETCHING NOTIFICATIONS");
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

  const fetchID = async () => {
    try {
      const response = await fetch("/api/users/id", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user ID");
      }

      const user = await response.json();
      return user; // Ritorna l'utente
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching user ID");
      throw err; // Rilancia l'errore per gestirlo in initializeSocket
    }
  };

  useEffect(() => {
    const initializeSocket = async () => {
      setIsLoading(true);
      try {
        // Fetch user ID
        const user = await fetchID();
        await fetchNotifications();
        console.log("id", user._id);

        // Inizializza la connessione socket
        socketRef.current = io("https://site232454.tw.cs.unibo.it");
        console.log("Connected to socket notification server");

        socketRef.current.on("connect", () => {
          console.log("Connected to notification server");
          // Invia l'ID utente per unirsi alla room personale
          socketRef.current?.emit("join_notification", user._id);
          console.log("Joined notification socket with ID:", user._id);
        });

        // Ascolta per nuove notifiche
        socketRef.current.on(
          "new_notification",
          (notification: Notification) => {
            console.log("Received new notification", notification);
            setNotifications((prev) => [notification, ...prev]);
            setLatestNotification(notification);

            // Rimuovi la latest notification dopo alcuni secondi
            setTimeout(() => {
              setLatestNotification(null);
            }, 5000);
          },
        );

        // Gestione errori di connessione
        socketRef.current.on("connect_error", (error: any) => {
          console.error("Socket connection error:", error);
          setError("Failed to connect to notification server");
        });
      } catch (error) {
        console.error("Error initializing socket:", error);
        setError(
          error instanceof Error ? error.message : "Error initializing socket",
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch le notifiche iniziali
    // Avvia l'inizializzazione
    initializeSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_notification");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
        console.log("Disconnected from notification server");
      }
    };
  }, []);

  const handleClearAll = async () => {
    try {
      const response = await fetch("/api/users/inbox", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }

      setNotifications([]); // Aggiorna lo stato locale dopo la cancellazione
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error clearing notifications",
      );
    }
  };

  const handleDeleteOne = async (notification: Notification) => {
    try {
      const response = await fetch(`/api/users/inbox/${notification._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error deleting notification",
      );
    }
  };

  return (
    <div className="flex items-center">
      {latestNotification && (
        <ToastNotification notification={latestNotification} />
      )}
      <Dropdown
        className="overflow-y-auto scrollbar-hide"
        placement="bottom-end"
      >
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
          className="w-80 max-h-[40vh] "
          aria-label="Notifications"
          variant="flat"
          color="success"
        >
          <DropdownSection title="Notifiche" showDivider>
            <DropdownItem
              className="text-danger"
              color="danger"
              onClick={handleClearAll}
            >
              Clear All
            </DropdownItem>
          </DropdownSection>

          <DropdownSection>
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
                  className="px-2 py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = notification.link;
                  }}
                  closeOnSelect={false}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-grow">
                      <div className="font-semibold">{notification.title}</div>
                      <div className="text-sm text-default-500">
                        {notification.body}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteOne(notification);
                      }}
                      className="p-1 rounded-full hover:bg-default-200 transition-colors"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                </DropdownItem>
              ))
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
