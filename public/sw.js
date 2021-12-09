console.log("[Chooj SW] Hello Chooj's service worker is alive");

self.onpushsubscriptionchange = (evt) => {
  console.log("[Chooj SW] PushSubscriptionChange");
  console.log(evt);
};

self.oninstall = (evt) => {
  console.log("[Chooj SW] Install");
  self.skipWaiting();
};

self.onactivate = (evt) => {
  console.log("[Chooj SW] Activate");
  evt.waitUntil(self.clients.claim());
};

self.onpush = (evt) => {
  console.log("[Chooj SW] got PUSHY");
  console.log("[Chooj SW] Push ", evt.data.text());
  let data = evt.data.json();
  const content = data.content;
  const senderDisplayName = data.sender_display_name;
  if (content && content.body && content.msgtype === "m.text") {
    console.log("Showing notification type #1");
    evt.waitUntil(
      self.registration.showNotification(data.room_name || "New message!", {
        body: content.body,
        vibrate: [200, 100, 200, 100, 200],
      })
    );
  } else if (data.type === "m.room.message" && senderDisplayName) {
    console.log("Showing notification type #2");
    evt.waitUntil(
      self.registration.showNotification(senderDisplayName, {
        body: `${data.counts.unread} new message(s)`,
        vibrate: [200, 100, 200, 100, 200],
      })
    );
  }
};

self.onnotificationclick = (evt) => {
  evt.notification.close();
  evt.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (clients.length === 0) {
        self.clients.openApp();
      }
    })
  );
};
