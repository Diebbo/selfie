self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  try {
    const data = event.data.json();
    console.log("Parsed push data:", data);

    const notificationPromise = self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png", // Assicurati di avere un'icona nel tuo progetto
      badge: "/badge.png", // Opzionale
      data: data, // Passa tutti i dati alla notifica
    });

    event.waitUntil(notificationPromise);
  } catch (error) {
    console.error("Error handling push event:", error);
    // Mostra una notifica di fallback in caso di errore
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

  // Puoi aggiungere qui la logica per gestire il click sulla notifica
  // Ad esempio, aprire una specifica URL
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

self.addEventListener("install", function (event) {
  console.log("Service Worker installed");
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activated");
});
