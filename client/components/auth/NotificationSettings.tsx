"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";

export default function NotificationSettings() {
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [allDevices, setAllDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/auth/subscriptions", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData && Array.isArray(userData.subscriptions)) {
            const deviceNames = userData.subscriptions
              .map((sub: any) => sub.device_name)
              .filter((name: string | undefined) => name);
            setAllDevices(deviceNames);
          } else {
            console.error("Subscriptions not found or not an array:", userData);
          }
        } else {
          console.error("Failed to fetch devices");
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, [subscriptionStatus]);

  const subscribeToNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported");
      }
      if (!("PushManager" in window)) {
        throw new Error("Push notifications not supported");
      }

      if (!deviceName.trim()) {
        throw new Error("Please enter a device name");
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker is ready");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission not granted for Notification");
      }
      console.log("Notification permission granted");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BArVzOZBYjIUaERlLsbuv3nzabYBcODfyDBqnWnHDdXNalsZrIu0FC60bdeGlzIMEJcIVik9_9XImKHOwKuus_c",
      });

      // Aggiungi il device_name alla sottoscrizione
      const subscriptionWithDeviceName = {
        ...subscription.toJSON(),
        device_name: deviceName,
      };

      const response = await fetch("/api/auth/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionWithDeviceName),
      });
      const data = await response.json();

      if (response.ok) {
        setSubscriptionStatus(data.message);
      } else {
        const err = await response.json();
        setSubscriptionStatus(`${err.message}`);
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      setSubscriptionStatus(`Error: ${error}`);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!selectedDevice) {
      setSubscriptionStatus("Please select a device to remove.");
      return;
    }

    try {
      const response = await fetch("/api/auth/subscription", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_name: selectedDevice }),
        credentials: "include",
      });
      if (response.ok) {
        setSubscriptionStatus("Unsubscribed successfully!");
        setSelectedDevice(null);
        const updatedDevices = allDevices.filter(
          (device) => device !== selectedDevice,
        );
        setAllDevices(updatedDevices);
      } else {
        setSubscriptionStatus("Failed to unsubscribe.");
      }
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      setSubscriptionStatus("Error unsubscribing from notifications.");
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/auth/send-test-notification", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setSubscriptionStatus("Test notification sent!");
      } else {
        setSubscriptionStatus("Failed to send test notification.");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      setSubscriptionStatus("Error sending test notification.");
    }
  };

  const sendClientSideNotification = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification from the client side!",
        icon: "/path/to/icon.png", // Sostituisci con il percorso della tua icona
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Test Notification", {
            body: "This is a test notification from the client side!",
            icon: "/path/to/icon.png", // Sostituisci con il percorso della tua icona
          });
        }
      });
    }
  };

  return (
    <div>
      <h2 className="text-md mb-3">Aggiungi dispositivo Push</h2>

      <div className="flex flex-col-1 gap-3">
        <Input
          placeholder="Device Name"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <Button
          variant="ghost"
          color="primary"
          onClick={subscribeToNotifications}
        >
          Aggiungi
        </Button>
      </div>

      <h2 className="text-md mb-2 mt-5">Rimuovi dispositivo Push</h2>
      <div className="flex flex-col-1 gap-3">
        <Select
          placeholder={
            allDevices.length > 0
              ? "Choose Device to Remove"
              : "No devices found"
          }
          label="Choose Device to Remove"
          isDisabled={allDevices.length === 0}
          onClick={() => setSubscriptionStatus("")}
          selectedKeys={selectedDevice ? [selectedDevice] : []}
          onSelectionChange={(keys) =>
            setSelectedDevice(keys.currentKey as string)
          }
        >
          {allDevices.length > 0 ? (
            allDevices.map((device) => (
              <SelectItem key={device} value={device}>
                {device}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="" value="no-device" isDisabled>
              No devices found
            </SelectItem>
          )}
        </Select>
        <Button
          variant="ghost"
          color="warning"
          onClick={unsubscribeFromNotifications}
        >
          Rimuovi
        </Button>
      </div>

      <p
        className={`mt-3 ${subscriptionStatus.includes("successfully") || subscriptionStatus.includes("Updated") ? "text-success" : "text-danger"}`}
      >
        {subscriptionStatus}
      </p>
    </div>
  );
}
