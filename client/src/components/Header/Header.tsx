// Header.tsx

import {
  /*   BarChart as BarChartIcon,
   */ Category as CategoryIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  LocalOffer as LocalOfferIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  AppBar,
  Box,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "animate.css";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import { handleLogout } from "../../features/auth/authSlice";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";
import { clearSelection } from "../../features/data/dataSlice";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import UserAvatar from "./UserAvatar";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [iconChange, setIconChange] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const location = useLocation(); // Get current location
  const prevLocationRef = useRef<string>(location.pathname); // Initialize previous location

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  useEffect(() => {
    if (
      prevLocationRef.current === "/visits" &&
      location.pathname !== "/visits"
    ) {
      dispatch(clearSelection());
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (
      prevLocationRef.current === "/messages" &&
      location.pathname !== "/messages"
    ) {
      dispatch(clearCurrentChatReducer());
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (
      prevLocationRef.current === "/promos" &&
      location.pathname !== "/promos"
    ) {
      dispatch(clearSelection());
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, dispatch]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setTimeout(() => {
      setIconChange(!drawerOpen);
    }, 500);
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
      case "employee":
        dashboardLink = "/employee-dashboard";
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
      case "employee":
        dashboardLink = "/employee-dashboard";
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
          <ListItemText primary={t("headerDashboard", "Dashboard")} />
        </ListItem>

        {userRole !== "employee" && (
          <ListItem
            button
            component={Link}
            to="/movements"
            onClick={toggleDrawer}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary={t("movements", "Movements")} />
          </ListItem>
        )}

        {userRole !== "employee" && (
          <ListItem
            button
            component={Link}
            to="/clients"
            onClick={toggleDrawer}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary={t("clients", "Clients")} />
          </ListItem>
        )}

        {userRole !== "employee" && (
          <ListItem
            button
            component={Link}
            to="/articles"
            onClick={toggleDrawer}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary={t("articles", "Articles")} />
          </ListItem>
        )}

        {userRole !== "employee" && (
          <ListItem button component={Link} to="/visits" onClick={toggleDrawer}>
            <ListItemIcon sx={{ color: "white" }}>
              <EventNoteIcon />
            </ListItemIcon>
            <ListItemText primary={t("visits", "Visits")} />
          </ListItem>
        )}

        {userRole !== "employee" && (
          <ListItem button component={Link} to="/promos" onClick={toggleDrawer}>
            <ListItemIcon sx={{ color: "white" }}>
              <LocalOfferIcon />
            </ListItemIcon>
            <ListItemText primary={t("promos", "Promos")} />
          </ListItem>
        )}

        {userRole !== "client" && (
          <ListItem
            button
            component={Link}
            to="/calendar"
            onClick={toggleDrawer}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary={t("calendar", "Calendar")} />
          </ListItem>
        )}
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
          backgroundColor: "rgba(0, 0, 0, 1)", // Slightly more transparent for a frosty look
          borderBottomLeftRadius: "32px", // Rounded corners for a smoother look
          borderBottomRightRadius: "32px", // Rounded corners for a smoother look
          boxShadow: `0px 4px 12px rgba(0, 0, 0, 0.1)`, // Soft shadow for depth
          width: "100%",
          right: "auto",
          left: "auto",
          maxWidth: "100vw", // Prevents overflowing past the viewport width
        }}
        className="animate__animated animate__fadeInDown" // Apply the animation class here
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
          <NotificationBell /> {/* Render the NotificationBell component */}
          <UserAvatar /> {/* Render the UserAvatar component */}
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
            borderBottomRightRadius: "32px",
            borderTopRightRadius: "32px",
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
    </>
  );
};

export default React.memo(Header);
