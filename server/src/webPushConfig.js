import webpush from "web-push";

const vapidKeys = {
  publicKey:
    "BArVzOZBYjIUaERlLsbuv3nzabYBcODfyDBqnWnHDdXNalsZrIu0FC60bdeGlzIMEJcIVik9_9XImKHOwKuus_c",
  privateKey: "tQhUMzbrWD8WDBTeY4KZSsv4JZxyLUsiW5x50GF5kAE",
};

webpush.setVapidDetails(
  "mailto:selfie.notifications@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

export { webpush, vapidKeys };
