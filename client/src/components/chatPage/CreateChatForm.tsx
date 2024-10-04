import CellTowerIcon from "@mui/icons-material/CellTower";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import "animate.css";

import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import {
  selectAllUsers,
  selectCurrentUser,
} from "../../features/users/userSlice";
import useChatLogic from "../../hooks/useChatsLogic";
import { showToast } from "../../services/toastMessage";
import UserList from "./UserList";

interface CreateChatFormProps {
  open: boolean;
  onClose: () => void;
}

interface CreateChatFormData {
  chatType: "group" | "broadcast";
  chatName: string;
  participants: string[]; // Array of user IDs
}

const CreateChatForm: React.FC<CreateChatFormProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const users = useAppSelector(selectAllUsers);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleCreateChat } = useChatLogic();
  const [searchTerm, setSearchTerm] = useState(""); // New search state

  const currentUserId = useAppSelector(selectCurrentUser)?._id;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue, // Added setValue

    formState: { errors },
  } = useForm<CreateChatFormData>({
    defaultValues: {
      chatType: "group",
      chatName: "",
      participants: [],
    },
  });

  const chatType = watch("chatType");

  // Reset form when opened
  useEffect(() => {
    if (open) {
      reset({
        chatType: "group",
        chatName: "",
        participants: [],
      });
      setSelectedUserIds([]);
      setSearchTerm(""); // Reset search term when form is opened
    }
  }, [open, reset]);

  // Handle user selection from the UserList component
  const handleUserSelect = (userId: string) => {
    if (!userId) {
      return;
    } else {
      setSelectedUserIds((prev) => {
        if (prev.includes(userId)) {
          return prev.filter((id) => id !== userId);
        } else {
          return [...prev, userId];
        }
      });
    }
  };

  // Filter users based on the search term
  const filteredUsers = users.filter((user) =>
    user.entityName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = async (data: CreateChatFormData) => {
    if (!chatType) {
      showToast.error(t("createChatForm.errors.chatTypeRequired"));
      return;
    }
    if (selectedUserIds.length === 0) {
      showToast.error(t("createChatForm.errors.noParticipants"));
      return;
    }

    if (!currentUserId) {
      showToast.error(t("createChatForm.errors.userNotLoggedIn"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine if the current user should be an admin
      let admins: string[] | undefined;
      if (chatType === "group" || chatType === "broadcast") {
        admins = [currentUserId];
      }

      // Prepare the participants array, ensuring the current user is included
      const participants = Array.from(
        new Set([currentUserId, ...selectedUserIds])
      );

      await handleCreateChat(
        participants,
        data.chatType,
        data.chatName,
        data.chatType === "broadcast" ? data.chatName : undefined,
        admins // Pass the admins array
      );

      showToast.success(t("createChatForm.success.createChat"));
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to create chat:", error);
      showToast.error(t("createChatForm.errors.createChatFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "2rem",
        },
        minHeight: "80dvh",
      }}
    >
      <DialogTitle>{t("createChatForm.title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          dividers
          sx={{
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none", // IE and Edge
            scrollbarWidth: "none", // Firefox
          }}
        >
          {" "}
          {/* Chat Type Selection */}
          <Box display="flex" justifyContent="center" mb={2}>
            <Tooltip title={t("createChatForm.tooltips.groupChat")}>
              <IconButton
                onClick={() => {
                  setValue("chatType", "group");
                  setSelectedUserIds([]);
                }} // Set chatType to "group"
                color={chatType === "group" ? "primary" : "default"}
              >
                <GroupIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("createChatForm.tooltips.broadcastChat")}>
              <IconButton
                onClick={() => {
                  setValue("chatType", "broadcast");
                  setSelectedUserIds([]);
                }} // Set chatType to "broadcast"
                color={chatType === "broadcast" ? "primary" : "default"}
              >
                <CellTowerIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Chat Type Hidden Field */}
          <Controller
            name="chatType"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />
          {/* Chat Name Input */}
          {(chatType === "group" || chatType === "broadcast") && (
            <Controller
              name="chatName"
              control={control}
              rules={{ required: t("createChatForm.errors.chatNameRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={
                    chatType === "group"
                      ? t("createChatForm.labels.groupName")
                      : t("createChatForm.labels.broadcastName")
                  }
                  fullWidth
                  margin="normal"
                  error={!!errors.chatName}
                  helperText={errors.chatName ? errors.chatName.message : ""}
                />
              )}
            />
          )}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            {t("createChatForm.labels.findParticipants")}
          </Typography>
          {/* Search Input for Filtering Users */}
          <TextField
            label={t("createChatForm.labels.searchUsers")}
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            placeholder={t("createChatForm.placeholders.searchPlaceholder")}
          />
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            {t("createChatForm.labels.selectParticipants")}
          </Typography>
          <UserList
            users={filteredUsers}
            currentUserId={currentUserId}
            selectedUserIds={selectedUserIds}
            onUserSelect={handleUserSelect}
          />
          {/* Display Selected Participants */}
          {selectedUserIds.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {selectedUserIds.map((userId) => {
                const user = users.find((u) => u._id === userId);
                return (
                  <Chip
                    key={userId}
                    className="animate__animated animate__fadeIn"
                    label={user?.entityName || t("userList.unknownUser")}
                    onDelete={() =>
                      setSelectedUserIds((prev) =>
                        prev.filter((id) => id !== userId)
                      )
                    }
                  />
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {/* Cancel Button */}
          <Tooltip title={t("createChatForm.tooltips.cancel")}>
            <IconButton
              onClick={onClose}
              color="secondary"
              aria-label={t("createChatForm.labels.cancel")}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>

          {/* Create Button */}
          <Tooltip title={t("createChatForm.tooltips.create")}>
            <IconButton
              type="submit"
              color="primary"
              disabled={isSubmitting}
              aria-label={t("createChatForm.labels.create")}
            >
              {isSubmitting ? <CircularProgress size={24} /> : <CheckIcon />}
            </IconButton>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateChatForm;
