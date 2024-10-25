self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  try {
    const data = event.data.json();
    console.log("Parsed push data:", data);

    const notificationPromise = self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
      badge: "/badge.png",
      data: { url: data.data.url },
      actions: [
        {
          action: "open_url",
          title: "Apri",
        },
      ],
    });

    event.waitUntil(notificationPromise);
  } catch (error) {
    console.error("Error handling push event:", error);
    // Show error notification
    event.waitUntil(
      self.registration.showNotification("Notification Error", {
        body: "There was an error processing the notification.",
      }),
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received:", event);
  event.notification.close();

  // Hnadle click on the notification
  if (event.action === "open_url" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";
    console.log("Opening URL:", urlToOpen);

    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        return clients.openWindow(urlToOpen);
      }),
    );
  }
});

self.addEventListener("install", function (event) {
  console.log("Service Worker installed");
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activated");
});
