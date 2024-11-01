// src/services/notifications.ts
import { AppStore, RootState } from "../app/store";
import { setCurrentChatById } from "../features/chat/chatSlice";
import router from "../router";

// Function to handle navigation programmatically
export const navigateToChat = (chatId: string, store: AppStore) => {
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
  state: RootState
) => {
  if (!("Notification" in window)) {
    return;
  }

  // Check if notifications are enabled
  const notificationsEnabled =
    localStorage.getItem("notificationsEnabled") !== "false";

  if (
    document.visibilityState === "visible" ||
    !notificationsEnabled ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const senderName = state.users.users[senderId]?.entityName || "Unknown User";
  const notificationTitle = `Message received from ${senderName}`;
  const notificationOptions = {
    body: messageContent,
    icon: "/images/rcs_icon.png",
  };

  try {
    const notification = new Notification(
      notificationTitle,
      notificationOptions
    );
    notification.onclick = () => {
      window.focus();
      navigateToChat(chatId, store);
    };
  } catch (error) {
    console.error("Error showing notification:", error);
  }
};
