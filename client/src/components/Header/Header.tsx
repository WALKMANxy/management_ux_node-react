// Header.tsx

import {
  BarChart as BarChartIcon,
  Category as CategoryIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  LocalOffer as LocalOfferIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import { handleLogout } from "../../features/auth/authSlice";
import GlobalSearch from "./GlobalSearch";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [iconChange, setIconChange] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setTimeout(() => {
      setIconChange(!drawerOpen);
    }, 500); // 500ms delay for icon change
  };

  const handleLogoClick = () => {
    let dashboardLink = "/";
    switch (userRole) {
      case "admin":
        dashboardLink = "/admin-dashboard";
        break;
      case "agent":
        dashboardLink = "/agent-dashboard";
        break;
      case "client":
        dashboardLink = "/client-dashboard";
        break;
      default:
        dashboardLink = "/";
    }
    navigate(dashboardLink);
  };

  const renderLinks = () => {
    let dashboardLink = "/";
    switch (userRole) {
      case "admin":
        dashboardLink = "/admin-dashboard";
        break;
      case "agent":
        dashboardLink = "/agent-dashboard";
        break;
      case "client":
        dashboardLink = "/client-dashboard";
        break;
      default:
        dashboardLink = "/";
    }

    return (
      <>
        <ListItem
          button
          component={Link}
          to={dashboardLink}
          onClick={toggleDrawer}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t("headerDashboard")} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/movements"
          onClick={toggleDrawer}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t("movements")} />
        </ListItem>
        <ListItem button component={Link} to="/clients" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary={t("clients")} />
        </ListItem>
        <ListItem button component={Link} to="/articles" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <CategoryIcon />
          </ListItemIcon>
          <ListItemText primary={t("articles")} />
        </ListItem>
        <ListItem button component={Link} to="/visits" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <EventNoteIcon />
          </ListItemIcon>
          <ListItemText primary={t("visits")} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/statistics"
          onClick={toggleDrawer}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary={t("statistics")} />
        </ListItem>
        <ListItem button component={Link} to="/promos" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <LocalOfferIcon />
          </ListItemIcon>
          <ListItemText primary={t("promos")} />
        </ListItem>
        <ListItem button component={Link} to="/messages" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary={t("messages")} />
        </ListItem>
      </>
    );
  };

  const renderLogoutLink = () => (
    <ListItem
      button
      component={Link}
      to="/"
      onClick={() => {
        initiateLogout();
        toggleDrawer(); // Close the drawer on logout
      }}
      sx={{ color: "white", paddingBottom: "20px" }}
    >
      <ListItemIcon sx={{ color: "white" }}>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary={t("logout")} />
    </ListItem>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "black",
          color: "black",
          width: "100%",
          right: "auto",
          left: "auto",
          maxWidth: "100vw", // Prevents overflowing past the viewport width
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
          }}
        >
          <Fade in={!iconChange} timeout={500}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ color: "white" }} // Scoped color style
            >
              {iconChange ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Fade>
          <img
            src="/images/logo-appbar.png"
            alt="Logo"
            style={{ height: "40px", marginRight: "16px", cursor: "pointer" }}
            onClick={handleLogoClick}
          />
          <GlobalSearch
            filter="all"
            placeholder={t("search")}
            isHeaderSearch={true}
          />
          <IconButton
            color="inherit"
            onClick={() => setModalOpen(true)}
            sx={{ color: "white" }}
          >
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ color: "white" }}>
            <Avatar alt="Agent Name" src="/path-to-avatar.jpg" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {/* This Toolbar component is added to push the content down */}
      {/* Blur backdrop */}
      {drawerOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backdropFilter: "blur(6px)", // Apply blur effect
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Slight dark overlay
            transition: "backdrop-filter 0.3s ease",
          }}
          onClick={toggleDrawer} // Close drawer when backdrop is clicked
        />
      )}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            backgroundColor: "black",
            color: "white",
            width: isMobile ? "auto" : "250px", // Conditional width based on screen size
            height: "100vh",
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
          disableScrollLock: true, // Prevent body padding adjustment
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", padding: "16px" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src="/images/logo-appbar.png"
              alt="Logo"
              style={{ height: "40px", marginLeft: "8px", cursor: "pointer" }}
              onClick={handleLogoClick}
            />
          </Box>
          <List sx={{ flexGrow: 1 }}>{renderLinks()}</List>
          <Box sx={{ mt: "auto" }}>{renderLogoutLink()}</Box>
        </Box>
      </Drawer>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            position: "relative",
            top: "7%",
            right: "2%",
            width: 250,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="notification-modal-title" variant="h6" component="h2">
            {t("notifications")}
          </Typography>
          <Typography id="notification-modal-description" sx={{ mt: 2 }}>
            {t("no_notifications")}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default React.memo(Header);
