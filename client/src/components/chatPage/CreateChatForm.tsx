//src/components/chatPage/CreateChatForm.tsx
import CellTowerIcon from "@mui/icons-material/CellTower";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import "animate.css";

import {
  Box,
  Button,
  ButtonGroup,
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
import { IChat } from "../../models/dataModels";
import { showToast } from "../../services/toastMessage";
import UserList from "./UserList";

interface CreateChatFormProps {
  open: boolean;
  onClose: () => void;
  chat?: IChat;
}

interface CreateChatFormData {
  chatType: "group" | "broadcast";
  chatName: string;
  participants: string[];
}

const CreateChatForm: React.FC<CreateChatFormProps> = ({
  open,
  onClose,
  chat,
}) => {
  const { t } = useTranslation();
  const users = useAppSelector(selectAllUsers);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleCreateChat, handleEditChat } = useChatLogic();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAdminTerm, setSearchAdminTerm] = useState("");

  const currentUserId = useAppSelector(selectCurrentUser)?._id;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateChatFormData>({
    defaultValues: {
      chatType: "group",
      chatName: "",
      participants: [],
    },
  });

  const chatType = watch("chatType");

  // State for role filtering
  const [role, setRole] = useState<string>("all");
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // Prefill form when editing or reset when creating
  useEffect(() => {
    if (open) {
      if (chat) {
        reset({
          chatType: chat.type as "group" | "broadcast",
          chatName: chat.name || "",
          participants: chat.participants || [],
        });
        setSelectedUserIds(chat.participants || []);
        setSelectedAdminIds(chat.admins || []);
        setRole("all");
        setSelectAll(false);
        setSearchTerm("");
        setSearchAdminTerm("");
      } else {
        // Creating a new chat
        reset({
          chatType: "group",
          chatName: "",
          participants: [],
        });
        setSelectedUserIds([]);
        setSelectedAdminIds([]);
        setRole("all");
        setSelectAll(false);
        setSearchTerm("");
        setSearchAdminTerm("");
      }
    }
  }, [open, reset, chat]);

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

  // Handle admin selection from the UserList component
  const handleAdminSelect = (userId: string) => {
    if (!userId) {
      return;
    } else {
      setSelectedAdminIds((prev) => {
        if (prev.includes(userId)) {
          return prev.filter((id) => id !== userId);
        } else {
          return [...prev, userId];
        }
      });
    }
  };

  // Filter users based on the search term and selected role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.entityName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = role === "all" || user.role === role;
    return matchesSearch && matchesRole;
  });

  // Filter admins for broadcast chat based on searchAdminTerm
  const adminsFilteredUsers = users.filter((user) => {
    const isAdmin = user.role === "admin";
    const matchesSearch = user.entityName
      ?.toLowerCase()
      .includes(searchAdminTerm.toLowerCase());
    return isAdmin && matchesSearch;
  });

  // Reset selectAll based on filteredUsers and selectedUserIds
  useEffect(() => {
    if (selectAll) {
      const allFilteredSelected = filteredUsers.every((user) => {
        if (!user._id) {
          showToast.error(
            "Something wrong happened while selecting the users, please try refreshing the page"
          );
          return false;
        }
        return selectedUserIds.includes(user._id);
      });
      if (!allFilteredSelected) {
        setSelectAll(false);
      }
    }
  }, [filteredUsers, selectedUserIds, selectAll]);

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

      if (chatType === "group") {
        admins = [currentUserId];
      } else if (chatType === "broadcast" && selectedAdminIds) {
        // Safeguard: Check if currentUserId is already in selectedAdminIds
        admins = [
          ...selectedAdminIds.filter((id) => id !== currentUserId),
          currentUserId,
        ];
      } else if (chatType === "broadcast") {
        admins = [currentUserId];
      }

      // Prepare the participants array, ensuring the current user is included
      const participants = Array.from(
        new Set([currentUserId, ...selectedUserIds])
      );

      if (chat && chat._id) {
        // Editing an existing chat
        await handleEditChat(
          chat._id,
          {
            name: data.chatName,
            participants,
            admins,
            updatedAt: new Date(),
          }
        );
        showToast.success(t("createChatForm.success.editChat"));
      } else {
        // Creating a new chat
        await handleCreateChat(
          participants,
          data.chatType,
          data.chatName,
          data.chatType === "broadcast" ? data.chatName : undefined,
          admins
        );
        showToast.success(t("createChatForm.success.createChat"));
      }

      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to submit chat:", error.message);
      } else {
        console.error("Failed to submit chat:", error);
      }
      showToast.error(
        chat
          ? t("createChatForm.errors.editChatFailed")
          : t("createChatForm.errors.createChatFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role filter button click
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    // Reset selectAll based on current selection
    const isAllSelected = filteredUsers.every((user) => {
      if (!user._id) {
        showToast.error(
          "Something wrong happened while selecting the users, please try refreshing the page"
        );
        return false; // Safeguard to stop selection process
      }
      return selectedUserIds.includes(user._id);
    });
    setSelectAll(isAllSelected);
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
      <DialogTitle>
        {chat ? t("createChatForm.editTitle") : t("createChatForm.title")}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          dividers
          sx={{
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {/* Chat Type Selection */}
          <Box display="flex" justifyContent="center" mb={2}>
            <Tooltip title={t("createChatForm.tooltips.groupChat")}>
              <IconButton
                onClick={() => {
                  setValue("chatType", "group");
                  setSelectedUserIds([]);
                  setSelectedAdminIds([]);
                  setSelectAll(false);
                }}
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
                  setSelectedAdminIds([]);
                  setSelectAll(false);
                }}
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

          {/* Admin Selection for Broadcast Chats */}
          {chatType === "broadcast" && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                {t("createChatForm.labels.selectAdmins")}
              </Typography>
              {/* Search Input for Admins */}
              <TextField
                label={t("createChatForm.labels.searchAdmins")}
                fullWidth
                variant="outlined"
                value={searchAdminTerm}
                onChange={(e) => setSearchAdminTerm(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
                placeholder={t(
                  "createChatForm.placeholders.searchAdminPlaceholder"
                )}
              />
              {/* Admin User List */}
              <UserList
                users={adminsFilteredUsers}
                currentUserId={currentUserId}
                selectedUserIds={selectedAdminIds}
                onUserSelect={handleAdminSelect}
              />
              {/* Display Selected Admins */}
              {selectedAdminIds.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {selectedAdminIds.map((userId) => {
                    const user = users.find((u) => u._id === userId);
                    return (
                      <Chip
                        key={userId}
                        className="animate__animated animate__fadeIn"
                        label={user?.entityName || t("userList.unknownUser")}
                        onDelete={() =>
                          setSelectedAdminIds((prev) =>
                            prev.filter((id) => id !== userId)
                          )
                        }
                      />
                    );
                  })}
                </Box>
              )}
            </>
          )}

          {/* Find Participants */}
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
          {/* Role Selection Buttons */}
          <Box display="flex" flexDirection="column" gap={1} mb={2}>
            <ButtonGroup
              variant="contained"
              aria-label={t("userDetails.roleSelection", "Role selection")}
              sx={{
                boxShadow: "none",
                gap: "auto",
                pb: 1,
                pt: 2,
              }}
            >
              <Tooltip
                title={t("userDetails.selectClient", "Select Client role")}
                placement="top"
              >
                <Button
                  onClick={() => handleRoleChange("client")}
                  sx={{
                    backgroundColor: role === "client" ? "green" : "black",
                    color: "white",
                    borderRadius: "20px",
                  }}
                >
                  {t("userDetails.client", "Client")}
                </Button>
              </Tooltip>

              <Tooltip
                title={t("userDetails.selectAgent", "Select Agent role")}
                placement="top"
              >
                <Button
                  onClick={() => handleRoleChange("agent")}
                  sx={{
                    backgroundColor: role === "agent" ? "blue" : "black",
                    color: "white",
                  }}
                >
                  {t("userDetails.agent", "Agent")}
                </Button>
              </Tooltip>

              <Tooltip
                title={t("userDetails.selectAdmin", "Select Admin role")}
                placement="top"
              >
                <Button
                  onClick={() => handleRoleChange("admin")}
                  sx={{
                    backgroundColor: role === "admin" ? "purple" : "black",
                    color: "white",
                  }}
                >
                  {t("userDetails.admin", "Admin")}
                </Button>
              </Tooltip>

              <Tooltip
                title={t("userDetails.selectEmployee", "Select Employee role")}
                placement="top"
              >
                <Button
                  onClick={() => handleRoleChange("employee")}
                  sx={{
                    backgroundColor: role === "employee" ? "orange" : "black",
                    color: "white",
                    minWidth: "100px",
                  }}
                >
                  {t("userDetails.employee", "Employee")}
                </Button>
              </Tooltip>

              {/* All Button */}
              <Tooltip
                title={t("userDetails.selectAll", "Show All Users")}
                placement="top"
              >
                <Button
                  onClick={() => handleRoleChange("all")}
                  sx={{
                    backgroundColor: role === "all" ? "grey" : "black",
                    color: "white",
                    borderRadius: "20px",
                  }}
                >
                  {t("userDetails.all", "All")}
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Box>
          {/* User List */}
          <UserList
            users={filteredUsers}
            currentUserId={currentUserId}
            selectedUserIds={selectedUserIds}
            onUserSelect={handleUserSelect}
          />
          {/* Select All / Deselect All Button */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="outlined"
              onClick={() => {
                if (selectAll) {
                  // Deselect all currently filtered users
                  setSelectedUserIds((prevSelected) =>
                    prevSelected.filter(
                      (id) => !filteredUsers.some((user) => user._id === id)
                    )
                  );
                } else {
                  // Select all currently filtered users
                  const filteredUserIds = filteredUsers
                    .map((user) => user._id)
                    .filter((id): id is string => id !== undefined); 

                  setSelectedUserIds((prevSelected) =>
                    Array.from(new Set([...prevSelected, ...filteredUserIds]))
                  );
                }
                setSelectAll(!selectAll);
              }}
              color="primary"
            >
              {selectAll
                ? t("createChatForm.buttons.deselectAll")
                : t("createChatForm.buttons.selectAll")}
            </Button>
          </Box>

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

          {/* Create/Edit Button */}
          <Tooltip
            title={
              chat
                ? t("createChatForm.tooltips.edit")
                : t("createChatForm.tooltips.create")
            }
          >
            <IconButton
              type="submit"
              color="primary"
              disabled={isSubmitting}
              aria-label={
                chat
                  ? t("createChatForm.labels.edit")
                  : t("createChatForm.labels.create")
              }
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
