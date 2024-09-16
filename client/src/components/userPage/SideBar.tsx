// src/components/UserPage/Sidebar.tsx

import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";

interface NavItem {
  text: string;
  icon: React.ReactElement;
  section: "modify-account" | "app-settings" | "manage-users";
  adminOnly?: boolean;
}

interface SidebarProps {
  onSelectSection: (
    section: "modify-account" | "app-settings" | "manage-users"
  ) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectSection }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentUser = useAppSelector(selectCurrentUser);

  const navItems: NavItem[] = [
    {
      text: "Account Settings",
      icon: <AccountCircleIcon />,
      section: "modify-account",
    },
    {
      text: "App Settings",
      icon: <SettingsIcon />,
      section: "app-settings",
    },
    {
      text: "Manage Users",
      icon: <PeopleIcon />,
      section: "manage-users",
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !(item.adminOnly && currentUser?.role !== "admin")
  );

  return (
    <Box
      component="nav"
      sx={{
        width: isMobile ? 60 : 240, // Narrower width on mobile
        flexShrink: 0,
        height: "100vh", // Full height to match the layout
        bgcolor: "transparent", // Transparent background
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRight:  "1px solid rgba(0, 0, 0, 0.12)", // Optional border for non-mobile
        overflowY: "auto",
        transition: "width 0.3s", // Smooth transition for width change
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      <Toolbar>
        {!isMobile && (
          <Typography variant="h6" noWrap component="div">
            User Settings
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ width: "100%", px: isMobile ? 0 : 2 }}>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => onSelectSection(item.section)}
              sx={{
                justifyContent: isMobile ? "center" : "flex-start",
                minHeight: 48,
                "& .MuiListItemIcon-root": {
                  minWidth: 0,
                  marginRight: isMobile ? 0 : 3,
                  justifyContent: "center",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {!isMobile && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
