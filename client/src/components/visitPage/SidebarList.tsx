/* eslint-disable @typescript-eslint/no-explicit-any */
// ListItemComponent.tsx
import React from "react";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { Agent, Client } from "../../models/entityModels";
import { useTranslation } from "react-i18next";
import StatusIndicatorSidebar from "./StatusIndicatorSidebar";

interface ListItemComponentProps {
  item: Agent | Client;
  counts?: any; // Define a proper type based on counts structure
  isSelected: boolean;
  onClick: () => void;
}

const ListItemComponent: React.FC<ListItemComponentProps> = ({
  item,
  counts,
  isSelected,
  onClick,
}) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery("(max-width:600px)");

  const renderSecondary = () => {
    if ("clients" in item) {
      return `${t("visitsSidebar.id", "ID")}: ${item.id}`;
    } else {
      return `${t("visitsSidebar.code", "Code")}: ${item.id} | ${t(
        "visitsSidebar.province",
        "Province"
      )}: ${item.province || t("visitsSidebar.na", "N/A")}`;
    }
  };

  return (
    <>
      <ListItem
        button
        selected={isSelected}
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "12px",
        }}
      >
        <ListItemAvatar>
          <Avatar>{item.name.charAt(0).toUpperCase()}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={item.name} secondary={renderSecondary()} />
        {counts && (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
            sx={{ height: "100%", pt: isMobile ? 0: 4 }}
          >
            {/* Render Status Indicators */}
            {"hasPending" in counts && counts.hasPending && (
              <StatusIndicatorSidebar type="pending" />
            )}
            {"hasIncomplete" in counts && counts.hasIncomplete && (
              <StatusIndicatorSidebar type="incomplete" />
            )}
            {"pendingCount" in counts && counts.pendingCount > 0 && (
              <StatusIndicatorSidebar type="pending" count={counts.pendingCount} />
            )}
            {"incompleteCount" in counts && counts.incompleteCount > 0 && (
              <StatusIndicatorSidebar type="incomplete" count={counts.incompleteCount} />
            )}
          </Box>
        )}
      </ListItem>
      <Divider sx={{ my: 1 }} />
    </>
  );
};

export default React.memo(ListItemComponent);
