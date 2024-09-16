//Src/components/chatPage/ContactsList.tsx
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
import React from "react";
import { User } from "../../models/entityModels"; // Adjust the import path based on your project structure

interface ContactsListProps {
  contacts: Partial<User>[]; // Adjust this type based on your user model
  searchTerm?: string; // Make searchTerm optional
  handleContactSelect: (contactId: string) => void;
  loading: boolean; // Loading state prop
}

// Utility to sanitize the search term
const sanitizeSearchTerm = (term: string) =>
  term.replace(/[^\w\s]/gi, "").toLowerCase();

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  searchTerm = "", // Default searchTerm to an empty string if not provided
  handleContactSelect,
  loading,
}) => {
/*   console.log("ContactsList rendering now");
 */
  // Log the props to understand what's being passed
  //console.log("Contacts received:", contacts);
  //console.log("Search term:", searchTerm);
 // console.log("Loading state:", loading);

  const sanitizedTerm = sanitizeSearchTerm(searchTerm);

  // Filter contacts based on the search term
  const filteredContacts = contacts.filter((contact) =>
    contact.entityName?.toLowerCase().includes(sanitizedTerm)
  );

  return (
    <List>
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <ListItem key={index}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="80%" sx={{ ml: 2 }} />
          </ListItem>
        ))
      ) : filteredContacts.length > 0 ? (
        filteredContacts.map((contact) => (
          <ListItem
            button
            key={contact._id}
            onClick={() => handleContactSelect(contact._id || "")}
            sx={{ borderBottom: "1px solid #e0e0e0" }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={0} // Optional: can display notifications related to the contact
                color="secondary"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Avatar src={contact.avatar}>
                  {contact.entityName?.charAt(0)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={contact.entityName || "Unknown Contact"}
              secondary={contact.role || "Contact"}
              secondaryTypographyProps={{ color: "textSecondary" }}
            />
          </ListItem>
        ))
      ) : (
        <Box textAlign="center" p={2}>
          <Typography variant="body1" color="textSecondary">
            No contacts found. Try adjusting your search.
          </Typography>
        </Box>
      )}
    </List>
  );
};

export default React.memo(ContactsList);
