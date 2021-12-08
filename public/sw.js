self.addEventListener("push", (evt) => {
  const data = evt.data.json();
  const content = data.content;
  if (content && content.body && content.msgtype === "m.text") {
    let notif = new Notification(data.room_name || "New message!", {
      body: content.body,
      vibrate: [200, 100, 200, 100, 200],
    });
  }
});
