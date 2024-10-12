"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function PushNotificationTest() {
  const [subscriptionStatus, setSubscriptionStatus] = useState("");

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

  const subscribeToNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported");
      }
      if (!("PushManager" in window)) {
        throw new Error("Push notifications not supported");
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
      console.log("Push subscription:", subscription);

      const response = await fetch("/api/auth/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setSubscriptionStatus("Subscribed successfully!");
      } else {
        const errorText = await response.text();
        throw new Error(`Subscription failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      setSubscriptionStatus(`Error: ${error}`);
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      const response = await fetch("/api/auth/subscription", {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setSubscriptionStatus("Unsubscribed successfully!");
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
      <h2>Push Notification Test</h2>
      <button onClick={subscribeToNotifications}>
        Subscribe to Notifications
      </button>
      <button onClick={sendTestNotification}>Send Test Notification</button>
      <button onClick={sendClientSideNotification}>
        Send Client-Side Notification
      </button>
      <p>{subscriptionStatus}</p>
    </div>
  );
}
