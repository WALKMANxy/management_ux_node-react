// src/components/chatPage/ContactsList.tsx
import {
  Avatar,
  Badge,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import { User } from "../../models/entityModels";
import { useTranslation } from "react-i18next";
import { sanitizeSearchTerm } from "../../utils/chatUtils";

interface ContactsListProps {
  contacts: Partial<User>[];
  searchTerm?: string;
  handleContactSelect: (contactId: string) => void;
  loading: boolean;
}




const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  searchTerm = "",
  handleContactSelect,
  loading,
}) => {
  const { t } = useTranslation();

  /*
    console.log("ContactsList rendering now");
    console.log("Contacts received:", contacts);
    console.log("Search term:", searchTerm);
    console.log("Loading state:", loading);
  */

  const sanitizedTerm = sanitizeSearchTerm(searchTerm);

  // Filter contacts based on the search term
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) =>
      contact.entityName?.toLowerCase().includes(sanitizedTerm)
    );
  }, [contacts, sanitizedTerm]);

  return (
    <List>
      {loading ? (
        // Display skeletons while loading contacts
        Array.from({ length: 5 }).map((_, index) => (
          <ListItem key={index}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="80%" sx={{ ml: 2 }} />
          </ListItem>
        ))
      ) : filteredContacts.length > 0 ? (
        // Display list of contacts
        filteredContacts.map((contact) => (
          <ListItem
            button
            key={contact._id || `contact-${contact.entityName}-${Math.random()}`}
            onClick={() =>
              contact._id ? handleContactSelect(contact._id) : null
            }
            sx={{ borderBottom: "1px solid #e0e0e0" }}
            aria-label={
              contact.entityName
                ? `${t("contactsList.labels.selectContact")} ${contact.entityName}`
                : t("contactsList.labels.unknownContact")
            }
          >
            <ListItemAvatar>
              <Badge
                badgeContent={0} 
                color="secondary"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Avatar src={contact.avatar} alt={contact.entityName || t("contactsList.labels.unknownContact")}>
                  {contact.entityName?.charAt(0).toUpperCase() || ""}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={contact.entityName || t("contactsList.labels.unknownContact")}
              secondary={contact.role || t("contactsList.labels.contact")}
              secondaryTypographyProps={{ color: "textSecondary" }}
            />
          </ListItem>
        ))
      ) : (
        // Display message when no contacts are found
        <Box textAlign="center" p={2}>
          <Typography variant="body1" color="textSecondary">
            {t("contactsList.messages.noContactsFound")}
          </Typography>
        </Box>
      )}
    </List>
  );
};

export default React.memo(ContactsList);
