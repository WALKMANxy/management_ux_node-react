// src/components/chatPage/ChatSidebar.tsx

import AddIcon from "@mui/icons-material/Add";
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
import "animate.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserRole } from "../../features/auth/authSlice";
import { fetchMessagesFromMultipleChatsThunk } from "../../features/chat/chatThunks";
import useChatLogic from "../../hooks/useChatsLogic";
import ChatList from "./ChatList";
import ContactsList from "./ContactsList";
import CreateChatForm from "./CreateChatForm";

const ChatSidebar: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate__fadeInLeft");
  const [isFirstMount, setIsFirstMount] = useState(true);

  const {
    chats,
    filteredContacts,
    handleContactSelect,
    fetchContacts,
    loadingContacts,
  } = useChatLogic();
  const messagesFetched = useRef(false);
  const contactsFetched = useRef(false);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [isCreateChatFormOpen, setIsCreateChatFormOpen] = useState(false);
  const userRole = useAppSelector(selectUserRole);

  // Handle first mount animation
  useEffect(() => {
    // After the first mount, set isFirstMount to false
    setIsFirstMount(false);
    // Cleanup animation class if necessary
    return () => {};
  }, []);

  // Determine the animation class
  const appliedAnimationClass = isFirstMount
    ? "animate__fadeInLeft animate_faster"
    : animationClass;

  const handleToggleContacts = useCallback(() => {
    // Apply fadeOut animation
    setAnimationClass("animate__fadeOut");
    // After fadeOut, toggle the view and apply fadeIn
    setTimeout(() => {
      setShowContacts((prev) => !prev);
      setAnimationClass("animate__fadeIn");
    }, 50); // Duration should match the animation duration
  }, []);

  useEffect(() => {
    if (!contactsFetched.current) {
      fetchContacts();
      contactsFetched.current = true;
    }
  }, [fetchContacts]);

  const handleRefreshContacts = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  useEffect(() => {
    if (
      searchTerm &&
      chats.length > 0 &&
      !showContacts &&
      !messagesFetched.current
    ) {
      const chatIds = chats
        .map((chat) => chat._id || chat.local_id)
        .filter(Boolean);
      if (chatIds.length > 0) {
        setLoading(true);
        dispatch(fetchMessagesFromMultipleChatsThunk(chatIds)).finally(() =>
          setLoading(false)
        );
        messagesFetched.current = true;
      }
    }
  }, [searchTerm, showContacts, chats, dispatch]);

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
      className={`animate__animated  ${appliedAnimationClass}`}
      sx={{
        p: 2,
        bgcolor: "#ffffff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
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
          {userRole === "admin" && !showContacts && (
            <Tooltip title={t("chatSidebar.tooltips.createChat")}>
              <IconButton
                onClick={() => setIsCreateChatFormOpen(true)}
                aria-label={t("chatSidebar.tooltips.createChat")}
              >
                <AddIcon />
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
        autoComplete="off"
        type="search"
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          mx: 1,
          borderRadius: "15px",
          width: "calc(100% - 16px)",
          "& .MuiOutlinedInput-root": {
            borderRadius: "25px",
          },
        }}
      />

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          // Hide the scrollbar
          "&::-webkitScrollbar": {
            display: "none",
          },
          // For Firefox
          scrollbarWidth: "none",
          // For IE and Edge
          MsOverflowStyle: "none",
        }}
      >
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

      {isCreateChatFormOpen && (
        <CreateChatForm
          open={isCreateChatFormOpen}
          onClose={() => setIsCreateChatFormOpen(false)}
        />
      )}
    </Box>
  );
};

export default React.memo(ChatSidebar);
