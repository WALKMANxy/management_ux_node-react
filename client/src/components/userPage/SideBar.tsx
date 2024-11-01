// src/components/UserPage/Sidebar.tsx
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
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
  section: "modify-account" | "app-settings" | "manage-users" | "manage-entities";
  adminOnly?: boolean;
}

interface SidebarProps {
  onSelectSection: (
    section: "modify-account" | "app-settings" | "manage-users"| "manage-entities"
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
    {
      text: t("sidebar.manageEntities", "Manage Entities"),
      icon: <PermContactCalendarIcon />,
      section: "manage-entities",
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
        maxHeight: "100dvh",
        width: isMobile ? 55 : 240,
        bgcolor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "center" : "flex-start",
        borderRight: isMobile ? "none" : "1px solid rgba(0, 0, 0, 0.12)",
        overflowX: "hidden",
        transition: "width 0.3s",
        borderTopRightRadius: isMobile ? 0 : 30,
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
          width: isMobile ? "83%" : "100%",
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
                boxShadow: theme.shadows[1],
                borderRadius: "8px",
                mb: 1,
                paddingX: isMobile ? 0 : 2,

                transition: "box-shadow 0.3s, border 0.3s",
                "&:hover": {
                  boxShadow: theme.shadows[4], 
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
