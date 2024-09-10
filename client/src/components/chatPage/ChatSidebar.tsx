import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { fetchMessagesFromMultipleChatsThunk } from "../../features/chat/chatSlice";
import useChatLogic from "../../hooks/useChatsLogic"; // Hook to manage chat logic
import ChatList from "./ChatList"; // ChatList Component
import ContactsList from "./ContactsList";

interface ChatSidebarProps {
  onChatSelect: () => void; // New prop for selecting a chat
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const {
    chats,
    filteredContacts,
    selectChat,
    handleContactSelect,
    fetchContacts,
    loadingContacts,
  } = useChatLogic();
  const messagesFetched = useRef(false);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false); // State to handle loading

  // Handle toggling between chats and contacts
  const handleToggleContacts = () => {
    setShowContacts((prev) => {
      if (!prev) {
        fetchContacts(); // Fetch contacts when switching to contacts view
      }
      return !prev;
    });
  };
  // Debounced search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
    },
    []
  );

  // Call onChatSelect when a chat is selected
  const handleChatClick = (chatId: string) => {
    console.log("Chat clicked with ID:", chatId); // Debug: Log the chat ID that was clicked

    try {
      selectChat(chatId); // Attempt to set the selected chat
      console.log("selectChat called successfully with ID:", chatId); // Debug: Log after selectChat is called
    } catch (error) {
      console.error("Error calling selectChat:", error); // Debug: Log any errors in selectChat
    }

    try {
      onChatSelect(); // Call the callback for when a chat is selected
      console.log("onChatSelect called successfully."); // Debug: Log after onChatSelect is called
    } catch (error) {
      console.error("Error calling onChatSelect:", error); // Debug: Log any errors in onChatSelect
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showContacts && searchTerm && chats.length > 0) {
        // Fetch messages from multiple chats when focusing on the search input, only if not fetched before
        const chatIds = chats.map((chat) => chat._id).filter(Boolean); // Ensure valid IDs
        if (chatIds.length > 0 && !messagesFetched.current) {
          setLoading(true); // Show loading state
          dispatch(fetchMessagesFromMultipleChatsThunk(chatIds)).finally(() =>
            setLoading(false)
          );
          messagesFetched.current = true; // Track that messages have been fetched
        }
      }
    }, 300); // Debounce delay of 300ms

    return () => clearTimeout(timer);
  }, [searchTerm, showContacts, chats, dispatch]);

  return (
    <Box
      className={`animate__animated ${
        showContacts ? "animate__fadeInRight" : "animate__fadeInLeft"
      }`}
      sx={{ p: 2, bgcolor: "#ffffff", height: "100%", overflowY: "auto" }}
    >
      {/* Header with title and toggle icon */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">
          {showContacts ? "Contacts" : "Chats"}
        </Typography>
        <IconButton onClick={handleToggleContacts}>
          {showContacts ? <ChatIcon /> : <ContactsIcon />}
        </IconButton>
      </Box>

      {/* Search bar */}
      <TextField
        variant="outlined"
        placeholder={`Search ${showContacts ? "Contacts" : "Chats"}`}
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => {
          if (!showContacts && chats.length > 0 && !messagesFetched.current) {
            setLoading(true); // Show loading state when focusing
            const chatIds = chats.map((chat) => chat._id).filter(Boolean);
            if (chatIds.length > 0) {
              dispatch(fetchMessagesFromMultipleChatsThunk(chatIds)).finally(
                () => setLoading(false)
              );
              messagesFetched.current = true;
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Conditional rendering of ChatList or ContactList */}
      {showContacts ? (
        <ContactsList
          contacts={filteredContacts}
          searchTerm={searchTerm}
          handleContactSelect={handleContactSelect}
          loading={loadingContacts} // Pass loading state
        />
      ) : (
        <ChatList
          chats={chats}
          searchTerm={searchTerm}
          selectChat={handleChatClick} // Use the new click handler
          loading={loading} // Pass loading state
        />
      )}
    </Box>
  );
};

export default ChatSidebar;
