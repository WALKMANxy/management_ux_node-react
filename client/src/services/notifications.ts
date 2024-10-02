// src/services/notifications.ts
import { RootState } from "../app/store";

export const handleNewNotification = (
  senderId: string,
  messageContent: string,
  state: RootState
) => {
  // console.log("handleNewNotification called with:", { senderId, messageContent });

  if (!("Notification" in window)) {
    return;
  }

  // Check if notifications are enabled and permission is granted
  const notificationsEnabled =
    localStorage.getItem("notificationsEnabled") !== "false";

  // console.log("Notifications enabled:", notificationsEnabled);
  // console.log("Notification permission:", Notification.permission);

  // Check if the app is in focus (visible) to avoid unnecessary notifications
  if (
    document.visibilityState === "visible" ||
    !notificationsEnabled ||
    Notification.permission !== "granted"
  ) {
    return;
  }
  // Extract the sender's name from the state
  const senderName = state.users.users[senderId]?.entityName || "Unknown User";
  // console.log("Sender extracted from state:", sender);

  // Create the notification content
  const notificationTitle = `Message received from ${senderName}`;
  const notificationOptions = {
    body: messageContent,
    icon: "/images/rcs_icon.png", // Adjust the path to your icon if necessary
  };

  // console.log("Notification details:", { notificationTitle, notificationOptions });

  try {
    // Show the notification
    new Notification(notificationTitle, notificationOptions);
    // console.log("Notification dispatched successfully.");
  } catch (error) {
    console.error("Error showing notification:", error);
  }
};
