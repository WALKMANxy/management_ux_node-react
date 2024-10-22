// src/services/notifications.ts
import { AppStore, RootState } from "../app/store"; // Import RootState type
import { setCurrentChatById } from "../features/chat/chatSlice";
import router from "../router";

// Function to handle navigation programmatically
export const navigateToChat = (chatId: string, store: AppStore) => {
  // Dispatch the setCurrentChatById reducer to set the selected chat
  if (!store) {
    console.error("Store has not been injected or passed.");
    return;
  }

  store.dispatch(setCurrentChatById(chatId));

  // Navigate to the /messages route
  router.navigate(`/messages`);
};

// Handle the new notification
export const handleNewNotification = (
  senderId: string,
  messageContent: string,
  chatId: string,
  store: AppStore,
  state: RootState // Passing the state directly
) => {
  if (!("Notification" in window)) {
    return;
  }

  // Check if notifications are enabled
  const notificationsEnabled = localStorage.getItem("notificationsEnabled") !== "false";

  if (
    document.visibilityState === "visible" ||
    !notificationsEnabled ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  // Extract the sender's name from the state
  const senderName = state.users.users[senderId]?.entityName || "Unknown User";

  // Create the notification content
  const notificationTitle = `Message received from ${senderName}`;
  const notificationOptions = {
    body: messageContent,
    icon: "/images/rcs_icon.png", // Adjust the path to your icon if necessary
  };

  try {
    // Show the notification
    const notification = new Notification(notificationTitle, notificationOptions);

    // Handle the notification click
    notification.onclick = () => {
      window.focus();
      navigateToChat(chatId, store); // Pass the store to the navigateToChat
    };
  } catch (error) {
    console.error("Error showing notification:", error);
  }
};
