// src/components/UserPage/ManageUsers.tsx

import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getAllUsersThunk,
  selectAllUsers,
} from "../../features/users/userSlice";
import { User } from "../../models/entityModels";
import UserDetails from "./UserDetails";

const ManageUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
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
  const handleRowDoubleClick = (user: Partial<User>) => {
    setSelectedUser(user);
  };

  // Reset selected user to null
  const handleBackToList = () => {
    setSelectedUser(null);
    dispatch(getAllUsersThunk());
  };

  const columns = [
    { id: "email", label: "Email", minWidth: 100 },
    { id: "authType", label: "Auth Type", minWidth: 100 },
    { id: "isEmailVerified", label: "Email Verified", minWidth: 100 },
    { id: "role", label: "Role", minWidth: 100 },
    { id: "entityCode", label: "Entity Code", minWidth: 100 },
    { id: "entityName", label: "Entity Name", minWidth: 100 },
    { id: "createdAt", label: "Created At", minWidth: 100 },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Users
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Show subtitle only if no user is selected */}
      {!selectedUser && (
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <InfoIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Select a user to assign it an entity
          </Typography>
        </Box>
      )}

      {selectedUser ? (
        <UserDetails user={selectedUser} onBack={handleBackToList} />
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="user table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{
                        minWidth: column.minWidth,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(0, visibleRows).map((user) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={user._id}
                    onDoubleClick={() => handleRowDoubleClick(user)} // Double click to select user
                  >
                    <TableCell
                      onTouchEnd={(e) => {
                        // Detect double-tap on mobile devices
                        if (e.detail === 2) {
                          handleRowDoubleClick(user);
                        }
                      }}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell>{user.authType}</TableCell>
                    <TableCell>{user.isEmailVerified ? "Yes" : "No"}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.entityCode}</TableCell>
                    <TableCell>{user.entityName || "N/A"}</TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow ref={ref} />
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ManageUsers;
