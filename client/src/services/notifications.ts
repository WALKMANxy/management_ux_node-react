// src/services/notifications.ts
import { RootState } from "../app/store";

export const handleNewNotification = (
  senderId: string,
  messageContent: string,
  state: RootState
) => {
  console.log("handleNewNotification called with:", { senderId, messageContent });

  // Check if notifications are enabled and permission is granted
  const notificationsEnabled = JSON.parse(localStorage.getItem("notificationsEnabled") || "true");
  console.log("Notifications enabled:", notificationsEnabled);
  console.log("Notification permission:", Notification.permission);

  // Check if the app is in focus (visible) to avoid unnecessary notifications
  if (document.visibilityState === "visible") {
    console.log("App is in focus, skipping notification.");
    return; // Do not show the notification if the app is in focus
  }

  if (!notificationsEnabled || Notification.permission !== "granted") {
    console.log("Notifications are not enabled or permission is not granted.");
    return; // Exit if notifications are not enabled or permission is not granted
  }

  // Extract the sender's name from the state
  const sender = state.users.users[senderId];
  console.log("Sender extracted from state:", sender);

  const senderName = sender ? sender.entityName || "Unknown User" : "Unknown User";
  console.log("Sender name determined:", senderName);

  // Create the notification content
  const notificationTitle = `Message received from ${senderName}`;
  const notificationOptions = {
    body: messageContent,
    icon: "/images/rcs_icon.png", // Adjust the path to your icon if necessary
  };

  console.log("Notification details:", { notificationTitle, notificationOptions });

  try {
    // Show the notification
    new Notification(notificationTitle, notificationOptions);
    console.log("Notification dispatched successfully.");
  } catch (error) {
    console.error("Error showing notification:", error);
  }
};
