import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppDispatch } from "../../app/hooks";
import { fetchMessagesFromMultipleChatsThunk } from "../../features/chat/chatSlice";
import useChatLogic from "../../hooks/useChatsLogic"; // Hook to manage chat logic
import ChatList from "./ChatList"; // ChatList Component
import ContactsList from "./ContactsList";

const ChatSidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const animationClass = useRef("animate__fadeInLeft");
  const {
    chats,
    filteredContacts,
    handleContactSelect,
    fetchContacts,
    loadingContacts,
  } = useChatLogic();
  const messagesFetched = useRef(false);
  const contactsFetched = useRef(false); // Ref to track if contacts have been fetched
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  // Handle toggling between contacts and chats with animations
  const handleToggleContacts = useCallback(() => {
    animationClass.current = showContacts
      ? "animate__fadeOut"
      : "animate__fadeOut";

    setTimeout(() => {
      setShowContacts((prev) => !prev);
      animationClass.current = showContacts
        ? "animate__fadeIn"
        : "animate__fadeIn";
    }, 200);
  }, [showContacts]);

  // Fetch contacts only once when the component is first rendered
  useEffect(() => {
    if (!contactsFetched.current) {
      fetchContacts();
      contactsFetched.current = true;
    }
  }, [fetchContacts]);

  // Handle manual refresh of contacts when refresh button is clicked
  const handleRefreshContacts = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handle search term changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Fetch messages when chats are visible and search term changes
  useEffect(() => {
    if (
      searchTerm &&
      chats.length > 0 &&
      !showContacts &&
      !messagesFetched.current
    ) {
      const chatIds = chats.map((chat) => chat._id).filter(Boolean);
      if (chatIds.length > 0) {
        setLoading(true);
        dispatch(fetchMessagesFromMultipleChatsThunk(chatIds)).finally(() =>
          setLoading(false)
        );
        messagesFetched.current = true;
      }
    }
  }, [searchTerm, showContacts, chats, dispatch]);

  // Memoized components for chat and contact lists to avoid unnecessary renders
  const chatList = useMemo(() => {
    return <ChatList searchTerm={searchTerm} loading={loading} />;
  }, [searchTerm, loading]);

  const contactsList = useMemo(() => {
    return (
      <ContactsList
        contacts={filteredContacts}
        searchTerm={searchTerm}
        handleContactSelect={handleContactSelect}
        loading={loadingContacts}
      />
    );
  }, [filteredContacts, searchTerm, handleContactSelect, loadingContacts]);

  return (
    <Box
      className={`animate__animated animate_faster ${animationClass.current}`}
      sx={{
        p: 2,
        bgcolor: "#ffffff",
        height: "100%",
        overflowY: "auto",
        borderTopLeftRadius: 12, // Apply radius to the top-left corner
        borderBottomLeftRadius: 12, // Apply radius to the bottom-left corner
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Header with title and toggle icon */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" sx={{ fontSize: "2rem" }}>
          {showContacts ? "Contacts" : "Chats"}
        </Typography>
        <Box display="flex" alignItems="center">
          {showContacts && (
            <IconButton onClick={handleRefreshContacts}>
              <RefreshIcon />
            </IconButton>
          )}
          <IconButton onClick={handleToggleContacts}>
            {showContacts ? <ChatIcon /> : <ContactsIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Search bar */}
      <TextField
        id="outlined-search"
        variant="outlined"
        placeholder={`Search ${showContacts ? "contacts" : "chats"}`}
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => {
          if (!showContacts && chats.length > 0 && !messagesFetched.current) {
            setLoading(true);
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
        sx={{
          mb: 2,
          mx: 1, // Adds small margins on the left and right
          borderRadius: "15px", // Rounded corners
          width: "calc(100% - 16px)", // Adjusts width to account for the margins
          "& .MuiOutlinedInput-root": {
            borderRadius: "25px", // Ensure the input itself has rounded corners
          },
        }}
      />

      {/* Render the memoized components based on the current view */}
      <Box
        sx={{
          position: "relative",
          display: showContacts ? "none" : "block",
          opacity: showContacts ? 0 : 1,
        }}
      >
        {chatList}
      </Box>
      <Box
        sx={{
          position: "relative",
          display: showContacts ? "block" : "none",
          opacity: showContacts ? 1 : 0,
        }}
      >
        {contactsList}
      </Box>
    </Box>
  );
};

export default ChatSidebar;
