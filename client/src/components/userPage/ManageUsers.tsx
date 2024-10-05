import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getAllUsersThunk,
  selectAllUsers,
  selectUsersLoading,
} from "../../features/users/userSlice";
import { User } from "../../models/entityModels";
import { showToast } from "../../services/toastMessage";
import UserDetails from "./UserDetails";
import "animate.css";

const ManageUsers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const loading = useAppSelector(selectUsersLoading);

  const [visibleRows, setVisibleRows] = useState<number>(20); // Start with 20 rows visible

  // Fetch all users when the component mounts
  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  // Handle lazy loading with Intersection Observer
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1, // Load more rows when 10% of the trigger is visible
  });

  useEffect(() => {
    if (inView && visibleRows < users.length) {
      setVisibleRows((prev) => prev + 20); // Load 20 more rows when scrolled to bottom
    }
  }, [inView, users.length, visibleRows]);

  // Handle row double click to select a user
  const handleRowDoubleClick = useCallback(
    (user: Partial<User>) => {
      setSelectedUser(user);
      showToast.success(
        t("manageUsers.selectedUser", "Selected user: ") + user.email
      );
    },
    [t]
  );

  // Reset selected user to null
  const handleBackToList = useCallback(() => {
    setSelectedUser(null);
    showToast.info(t("manageUsers.userDeselected", "User deselected"));
    dispatch(getAllUsersThunk());
  }, [dispatch, t]);

  // Define columns with desired order
  const columns = [
    {
      id: "email",
      label: t("manageUsers.columns.email", "Email"),
      minWidth: 150,
    },

    { id: "role", label: t("manageUsers.columns.role", "Role"), minWidth: 100 },
    {
      id: "entityCode",
      label: t("manageUsers.columns.entityCode", "Entity Code"),
      minWidth: 100,
    },
    {
      id: "entityName",
      label: t("manageUsers.columns.entityName", "Entity Name"),
      minWidth: 150,
    },
    {
      id: "authType",
      label: t("manageUsers.columns.authType", "Auth Type"),
      minWidth: 100,
    },
    {
      id: "isEmailVerified",
      label: t("manageUsers.columns.emailVerified", "Email Verified"),
      minWidth: 120,
    },
    {
      id: "createdAt",
      label: t("manageUsers.columns.createdAt", "Created At"),
      minWidth: 150,
    },
  ];

  return (
    <Box sx={{ width: "auto" }}>
      <Typography variant="h4" gutterBottom>
        {t("manageUsers.title", "Manage Users")}
      </Typography>

      {/* Information Tooltip */}
      {!selectedUser && (
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <Tooltip
            title={
              <Typography variant="body2">
                {t(
                  "manageUsers.infoTooltip",
                  "In order for a user to use the app, they need to be assigned an entity. You can use the table below to select a user by double-clicking on the email, and then proceed with the entity assignment."
                )}
              </Typography>
            }
            arrow
            placement="right"
          >
            <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
          </Tooltip>
          <Typography variant="subtitle1">
            {t(
              "manageUsers.selectUserPrompt",
              "Select a user to assign an entity"
            )}
          </Typography>
        </Box>
      )}

      {/* Render User Details with fadeIn animation */}
      {selectedUser ? (
        <div className="animate__animated animate__fadeIn">
          <UserDetails user={selectedUser} onBack={handleBackToList} />
        </div>
      ) : (
        <div className="animate__animated animate__fadeIn">
          <TableContainer
            sx={{
              minHeight: "40dvh", // Set minimum height
              maxHeight: 440,
            }}
          >
            <Table stickyHeader aria-label={t("manageUsers.userTable", "User Table")}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{
                        minWidth: column.minWidth,
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                        backgroundColor: theme.palette.action.hover,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: visibleRows }).map((_, index) => (
                      <TableRow
                        key={index}
                        className="animate__animated animate__fadeOut" // Fade out when loading
                      >
                        {columns.map((column) => (
                          <TableCell key={column.id}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : users.slice(0, visibleRows).map((user) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={user._id}
                        onClick={() => handleRowDoubleClick(user)}
                        sx={{
                          cursor: "pointer",
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                        className="animate__animated animate__fadeIn" // Fade in when loaded
                      >
                        <TableCell
                          onClick={
                            isMobile
                              ? () => handleRowDoubleClick(user)
                              : undefined
                          }
                          sx={{ color: "primary.main" }}
                        >
                          {user.email}
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.entityCode}</TableCell>
                        <TableCell>
                          {user.entityName || t("manageUsers.na", "N/A")}
                        </TableCell>
                        <TableCell>{user.authType}</TableCell>
                        <TableCell>
                          {user.isEmailVerified
                            ? t("manageUsers.yes", "Yes")
                            : t("manageUsers.no", "No")}
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : t("manageUsers.na", "N/A")}
                        </TableCell>
                      </TableRow>
                    ))}
                {/* Sentinel row for Intersection Observer */}
                <TableRow ref={ref}>
                  <TableCell colSpan={columns.length} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </Box>
  );
};

export default ManageUsers;
