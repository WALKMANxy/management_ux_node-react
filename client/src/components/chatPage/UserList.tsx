// src/components/chatPage/UserList.tsx

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { User } from "../../models/entityModels";

interface UserListProps {
  users: Partial<User>[];
  currentUserId?: string;
  selectedUserIds: string[];
  onUserSelect: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  selectedUserIds,
  onUserSelect,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Convert users object to array and filter out current user if necessary
  const userArray = useMemo(
    () => Object.values(users).filter((user) => user._id !== currentUserId),
    [users, currentUserId]
  );

  return (
    <TableContainer sx={{ maxHeight: 300 }}>
      <Table
        stickyHeader
        aria-label={t("userList.table", "User Selection Table")}
      >
        <TableBody>
          {userArray.map((user) => {
            if (!user._id) return null; // Skip users without an ID

            return (
              <TableRow
                key={user._id}
                hover
                role="checkbox"
                tabIndex={-1}
                onClick={() => {
                  if (user._id) {
                    onUserSelect(user._id);
                  }
                }}
                selected={user._id ? selectedUserIds.includes(user._id) : false}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedUserIds.includes(user._id)} />
                </TableCell>
                <TableCell component="th" scope="row">
                  {user.entityName || t("userList.unknownUser")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;
