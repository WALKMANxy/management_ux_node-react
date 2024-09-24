// src/components/chatPage/ChatSidebar.tsx

import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import "animate.css"; // Import animate.css for animations
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../app/hooks";
import { fetchMessagesFromMultipleChatsThunk } from "../../features/chat/chatThunks";
import useChatLogic from "../../hooks/useChatsLogic"; // Hook to manage chat logic
import ChatList from "./ChatList"; // ChatList Component
import ContactsList from "./ContactsList";

const ChatSidebar: React.FC = () => {
  const { t } = useTranslation();
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

  /**
   * Handles toggling between contacts and chats with fade-in/fade-out animations.
   */
  const handleToggleContacts = useCallback(() => {
    // Apply fade-out animation
    animationClass.current = "animate__fadeOut";

    setTimeout(() => {
      // Toggle the view
      setShowContacts((prev) => !prev);
      // Apply fade-in animation
      animationClass.current = "animate__fadeIn";
    }, 200); // Duration should match animate.css animation duration
  }, []);

  /**
   * Fetch contacts only once when the component is first rendered.
   */
  useEffect(() => {
    if (!contactsFetched.current) {
      fetchContacts();
      contactsFetched.current = true;
    }
  }, [fetchContacts]);

  /**
   * Handle manual refresh of contacts when refresh button is clicked.
   */
  const handleRefreshContacts = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  /**
   * Handle search term changes.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  /**
   * Fetch messages when chats are visible and search term changes.
   */
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

  /**
   * Memoized ChatList component to avoid unnecessary re-renders.
   */
  const chatList = useMemo(() => {
    return <ChatList searchTerm={searchTerm} loading={loading} />;
  }, [searchTerm, loading]);

  /**
   * Memoized ContactsList component to avoid unnecessary re-renders.
   */
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
      className={`animate__animated animate__faster ${animationClass.current}`}
      sx={{
        p: 2,
        bgcolor: "#ffffff",
        height: "100%",
        overflowY: "auto",
        borderTopLeftRadius: 12, // 16px equivalent
        borderBottomLeftRadius: 12, // 16px equivalent
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Header with title and toggle icons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" sx={{ fontSize: "2rem" }}>
          {showContacts
            ? t("chatSidebar.labels.contacts")
            : t("chatSidebar.labels.chats")}
        </Typography>
        <Box display="flex" alignItems="center">
          {showContacts && (
            <Tooltip title={t("chatSidebar.tooltips.refreshContacts")}>
              <IconButton
                onClick={handleRefreshContacts}
                aria-label={t("chatSidebar.tooltips.refreshContacts")}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            title={
              showContacts
                ? t("chatSidebar.tooltips.showChats")
                : t("chatSidebar.tooltips.showContacts")
            }
          >
            <IconButton
              onClick={handleToggleContacts}
              aria-label={
                showContacts
                  ? t("chatSidebar.tooltips.showChats")
                  : t("chatSidebar.tooltips.showContacts")
              }
            >
              {showContacts ? <ChatIcon /> : <ContactsIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search bar */}
      <TextField
        id="outlined-search"
        variant="outlined"
        placeholder={
          showContacts
            ? t("chatSidebar.placeholders.searchContacts")
            : t("chatSidebar.placeholders.searchChats")
        }
        fullWidth
        value={searchTerm}
        autoComplete="off" // Prevents autofill suggestions
        type="search" // Ensures minimal autofill interference
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

      {/* Render the memoized components with animations */}
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

export default React.memo(ChatSidebar);
