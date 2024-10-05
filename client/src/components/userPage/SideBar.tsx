// src/components/UserPage/Sidebar.tsx

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
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

const Sidebar: React.FC<SidebarProps> = React.memo(({ onSelectSection }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentUser = useAppSelector(selectCurrentUser);

  const navItems: NavItem[] = [
    {
      text: t("sidebar.accountSettings", "Account Settings"),
      icon: <AccountCircleIcon />,
      section: "modify-account",
    },
    {
      text: t("sidebar.appSettings", "App Settings"),
      icon: <SettingsIcon />,
      section: "app-settings",
    },
    {
      text: t("sidebar.manageUsers", "Manage Users"),
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
        width: isMobile ? 55 : 240, // Narrower width on mobile
        flexShrink: 0,
        bgcolor: "transparent", // Transparent background
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "center" : "flex-start",
        borderRight: isMobile ? "none" : "1px solid rgba(0, 0, 0, 0.12)", // Optional border for non-mobile
        overflowY: "auto",
        transition: "width 0.3s", // Smooth transition for width change
        borderTopRightRadius: isMobile ? 0 : 30,
        borderBottomRightRadius: isMobile ? 0 : 30,
      }}
    >
      <Toolbar>
        {!isMobile && (
          <Typography variant="h6" noWrap component="div">
            {t("sidebar.userSettings", "User Settings")}
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List
        sx={{
          width: isMobile ? "90%" : "100%",
          pr: isMobile ? 1 : 0,
          px: isMobile ? 0 : 2,
          my: isMobile ? 0 : 2,
          ml: isMobile ? 1 : 0,
        }}
      >
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ my: 1.5 }}>
            <ListItemButton
              onClick={() => onSelectSection(item.section)}
              sx={{
                justifyContent: isMobile ? "center" : "flex-start",
                minHeight: 48,
                boxShadow: theme.shadows[1], // Apply boxShadow from theme
                borderRadius: "8px",
                mb: 1, // Margin bottom for spacing between items
                paddingX: isMobile ? 0 : 2, // Reduced padding on mobile

                transition: "box-shadow 0.3s, border 0.3s",
                "&:hover": {
                  boxShadow: theme.shadows[4], // Enhance boxShadow on hover
                },
                "&.Mui-selected": {
                  boxShadow: theme.shadows[4],
                  bgcolor: theme.palette.action.selected,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isMobile ? 0 : 3,
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isMobile && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

export default Sidebar;
